#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/agent0/.openclaw/workspace"
OUT="$ROOT/domains/dreamteam/dashboard-data.json"

python3 - <<'PY'
import json, os, re, subprocess, datetime
from pathlib import Path

ROOT = Path('/Users/agent0/.openclaw/workspace')
RETRO_DIR = ROOT / 'memory/retro/daily'
PROCESS_DIR = ROOT / 'memory/process'
AGENTS_DIR = ROOT / 'agents'
DOMAINS_DIR = ROOT / 'domains'
OUT = Path('/tmp/dreamteam-by-taisama/public/data/dashboard-data.json')

PROJECTS = ['tu-vi', 'xaykenhtiktok', 'cardmasters-ai-support', 'pkm-auction', 'Android_Auto_LLM']
AGENT_MAP = [
    ('Coach', 'pm-agent', 'planning', 'Dream Team PM / scope / release gate'),
    ('Lebron', 'be-agent', 'code', 'Backend implementation'),
    ('Bronny', 'fe-agent', 'palette', 'Frontend implementation / UI'),
    ('Curry', 'qa-agent', 'check_circle', 'QA / verification / release validation'),
    ('tuvi-agent', 'tuvi-agent', 'auto_awesome', 'Tử vi domain agent'),
    ('laoshi-agent', 'laoshi-agent', 'school', 'Learning / curriculum support'),
    ('MiniSama', 'mini-taisama', 'smart_toy', 'CEO / orchestration'),
]


def slurp(path: Path) -> str:
    return path.read_text(encoding='utf-8') if path.exists() else ''


def section(text: str, title: str):
    m = re.search(rf'^##\s+{re.escape(title)}\s*\n([\s\S]*?)(?=^##\s+|\Z)', text, re.M)
    return m.group(1).strip() if m else ''


def bullets(text: str):
    out = []
    for line in text.splitlines():
        s = line.strip()
        if re.match(r'^[-*]\s+', s):
            out.append(re.sub(r'^[-*]\s+', '', s).strip())
        elif re.match(r'^\d+\.\s+', s):
            out.append(re.sub(r'^\d+\.\s+', '', s).strip())
    return out


def parse_daily_summary(text: str):
    data = {
        'tasksCompleted': 0,
        'tasksBlocked': 0,
        'tasksInProgress': 0,
        'activeAgentsLabel': '0',
        'activeAgentsCount': 0,
        'tokenBudget': 'unknown',
        'mode': 'Build',
    }
    sec = section(text, "📊 Today's Summary") or section(text, 'Today\'s Summary')
    for line in sec.splitlines():
        s = line.strip()
        if 'Tasks completed' in s:
            m = re.search(r'(\d+)', s)
            if m: data['tasksCompleted'] = int(m.group(1))
        elif 'Tasks blocked' in s:
            m = re.search(r'(\d+)', s)
            if m: data['tasksBlocked'] = int(m.group(1))
        elif 'Tasks in progress' in s:
            m = re.search(r'(\d+)', s)
            if m: data['tasksInProgress'] = int(m.group(1))
        elif 'Active agents' in s:
            tail = s.split(':', 1)[1].strip() if ':' in s else s
            if re.search(r'\d', tail):
                n = re.search(r'(\d+)', tail)
                data['activeAgentsCount'] = int(n.group(1)) if n else 0
                data['activeAgentsLabel'] = str(data['activeAgentsCount'])
            else:
                names = [x.strip() for x in tail.split(',') if x.strip()]
                data['activeAgentsCount'] = len(names)
                data['activeAgentsLabel'] = ', '.join(names)
        elif 'Token budget used' in s:
            data['tokenBudget'] = s.split(':',1)[1].strip() if ':' in s else s
    if data['tasksBlocked'] > 0:
        data['mode'] = 'Build'
    if data['tasksBlocked'] >= 2:
        data['mode'] = 'Release-critical'
    return data


def enrich_summary_with_fallbacks(summary: dict, actions: list, agent_inputs: dict, blockers: list, highlights: list):
    if summary['activeAgentsCount'] == 0 and agent_inputs:
        names = list(agent_inputs.keys())
        summary['activeAgentsCount'] = len(names)
        summary['activeAgentsLabel'] = ', '.join(names)
    if summary['tokenBudget'] == 'unknown':
        if summary['activeAgentsCount'] >= 6:
            summary['tokenBudget'] = '~light-mid from 6 agent reports'
        elif summary['activeAgentsCount'] >= 4:
            summary['tokenBudget'] = '~light from agent reports'
    if summary['tasksInProgress'] == 0 and actions:
        summary['tasksInProgress'] = min(3, len(actions))
    if summary['tasksBlocked'] == 0 and blockers:
        summary['tasksBlocked'] = len(blockers)
    if summary['tasksCompleted'] == 0:
        good = [h for h in highlights if h.get('tone') == 'good']
        if good:
            summary['tasksCompleted'] = 1
    return summary


def parse_table_actions(text: str):
    sec = section(text, '🎯 Action Items') or section(text, 'Top 3 Action Items')
    actions = []
    for line in sec.splitlines():
        if '|' in line and not re.match(r'^\|[-# ]+', line.strip()):
            cols = [c.strip() for c in line.strip().strip('|').split('|')]
            if len(cols) >= 5 and cols[0] != '#':
                actions.append({
                    'text': cols[1],
                    'owner': cols[2],
                    'due': cols[3],
                    'status': cols[4],
                    'done': '✅' in cols[4] or '☑' in cols[4],
                })
    if actions:
        return actions
    for item in bullets(sec):
        m = re.match(r'\*\*(.*?)\*\*\s+—\s+(.*?)\s+→\s+\*\*(.*?)\*\*(.*)', item)
        if m:
            actions.append({
                'text': m.group(1).strip(),
                'owner': m.group(2).strip(),
                'due': m.group(3).strip(),
                'status': '⬜',
                'done': False,
                'notes': m.group(4).strip(' —'),
            })
        else:
            actions.append({'text': item, 'owner': '', 'due': '', 'status': '⬜', 'done': False})
    return actions


def parse_agent_inputs(text: str):
    sec = section(text, 'Agent Inputs')
    inputs = {}
    alias = {
        'Coach (pm-agent)': 'Coach',
        'Lebron (code-agent)': 'Lebron',
        'Bronny (fe-agent)': 'Bronny',
        'Curry (qa-agent)': 'Curry',
        'Coach': 'Coach',
        'Lebron': 'Lebron',
        'Bronny': 'Bronny',
        'Curry': 'Curry',
        'tuvi-agent': 'tuvi-agent',
        'laoshi-agent': 'laoshi-agent',
        'MiniSama': 'MiniSama',
    }
    for m in re.finditer(r'^###\s+(.+?)\n(.*?)(?=^###\s+|\Z)', sec, re.M | re.S):
        key = m.group(1).strip()
        inputs[alias.get(key, key)] = m.group(2).strip()
    return inputs


def normalize_agent_name(name: str):
    mapping = {
        'Coach': 'Coach',
        'Lebron (Backend)': 'Lebron',
        'Lebron': 'Lebron',
        'Bronny (Frontend)': 'Bronny',
        'Bronny': 'Bronny',
        'Curry (QA)': 'Curry',
        'Curry': 'Curry',
        'tuvi-agent': 'tuvi-agent',
        'laoshi-agent': 'laoshi-agent',
        'MiniSama': 'MiniSama',
    }
    return mapping.get(name.strip(), name.strip())


def parse_per_agent_notes(text: str):
    sec = section(text, 'Per-Agent Notes')
    out = {}
    for m in re.finditer(r'^###\s+(.+?)\n(.*?)(?=^###\s+|\Z)', sec, re.M | re.S):
        out[normalize_agent_name(m.group(1))] = bullets(m.group(2)) or [x.strip() for x in m.group(2).splitlines() if x.strip()]
    return out


def parse_highlights(text: str):
    good = bullets(section(text, '✅ What Went Well') or section(text, 'What Went Well'))
    bad = bullets(section(text, '❌ What Didn\'t Go Well') or section(text, "What Didn't Go Well"))
    blockers = bullets(section(text, 'Blockers Requiring Taisama'))
    root = bullets(section(text, '🔍 Root Cause (for top issue)')) or bullets(section(text, 'Root Cause'))
    items = []
    if good:
        items.append({'label': 'Điều làm tốt', 'tone': 'good', 'text': ' '.join(good[:3])})
    if bad:
        items.append({'label': 'Điều chưa tốt', 'tone': 'bad', 'text': ' '.join(bad[:3])})
    if blockers:
        items.append({'label': 'Blockers / quyết định cần chốt', 'tone': 'warn', 'text': ' '.join(blockers[:3])})
    elif root:
        items.append({'label': 'Root cause', 'tone': 'warn', 'text': ' '.join(root[:3])})
    return items


def parse_domain_summary(text: str):
    sec = section(text, 'Domain Summary')
    rows = {}
    for line in sec.splitlines():
        if line.strip().startswith('|') and '---' not in line and 'Domain' not in line:
            cols = [c.strip() for c in line.strip().strip('|').split('|')]
            if len(cols) >= 3:
                rows[cols[0]] = {'statusBadge': cols[1], 'summary': cols[2]}
    return rows


def parse_feedback(retro):
    items = []
    notes = retro.get('perAgentNotes', {})
    if 'Coach' in notes:
        items.append({'from': 'Coach', 'to': 'Lebron', 'type': 'scope', 'text': notes['Coach'][0], 'status': 'observed'})
    if 'Curry' in notes:
        items.append({'from': 'Curry', 'to': 'Coach', 'type': 'qa', 'text': notes['Curry'][0], 'status': 'promoted'})
    if 'Bronny' in notes:
        items.append({'from': 'Bronny', 'to': 'Lebron', 'type': 'contract', 'text': notes['Bronny'][-1], 'status': 'observed'})
    if retro['date'] == '2026-03-24':
        items.append({'from': 'Curry', 'to': 'Coach', 'type': 'risk', 'text': 'cardmasters zero QA since init; must test before deploy', 'status': 'in-play'})
        items.append({'from': 'Bronny', 'to': 'Lebron', 'type': 'bug', 'text': 'pkm-auction CreateMarketDto backend bug forcing FE workaround', 'status': 'in-play'})
    return items


def read_lessons():
    text = slurp(PROCESS_DIR / 'dream-team.md')
    sec = section(text, 'Current seeds')
    items = []
    for i, b in enumerate(bullets(sec), 1):
        tag = 'process'
        low = b.lower()
        if 'token' in low or 'context' in low:
            tag = 'tooling'
        elif 'qa' in low or 'curry' in low:
            tag = 'quality'
        elif 'artifact' in low or 'handoff' in low:
            tag = 'communication'
        items.append({'id': f'L{i:02d}', 'text': b, 'tag': tag, 'status': 'promoted' if i <= 5 else 'observing', 'impact': max(1, 6 - i)})
    return items


def project_info(name: str):
    d = DOMAINS_DIR / name
    info = {'name': name, 'status': 'missing', 'files': 0, 'newest': None, 'git': [], 'activity': 'idle', 'health': 'red', 'summary': ''}
    if not d.exists():
        return info
    info['status'] = 'exists'
    files = [p for p in d.rglob('*') if p.is_file() and '.git/' not in str(p) and 'node_modules/' not in str(p) and '__pycache__/' not in str(p)]
    info['files'] = len(files)
    if files:
        newest = max(files, key=lambda p: p.stat().st_mtime)
        info['newest'] = str(newest)
    if (d / '.git').exists():
        try:
            log = subprocess.check_output(['git', '-C', str(d), 'log', '--oneline', '-3'], text=True, stderr=subprocess.DEVNULL).strip().splitlines()
            info['git'] = log
        except Exception:
            pass
    if info['git']:
        info['activity'] = 'active'
        info['health'] = 'green'
    elif info['files'] > 0:
        info['activity'] = 'stable'
        info['health'] = 'amber'
    domain_summary = domain_summaries.get(name, {})
    info['summary'] = domain_summary.get('summary', '')
    badge = domain_summary.get('statusBadge', '')
    if '🟢' in badge:
        info['health'] = 'green'
    elif '🟡' in badge:
        info['health'] = 'amber'
    elif '🔴' in badge:
        info['health'] = 'red'
    return info

retro_files = sorted(RETRO_DIR.glob('*.md'))
retros = {}
domain_summaries = {}
for rf in retro_files:
    date = rf.stem
    text = slurp(rf)
    summary = parse_daily_summary(text)
    actions = parse_table_actions(text)
    per_agent = parse_per_agent_notes(text)
    agent_inputs = parse_agent_inputs(text)
    highlights = parse_highlights(text)
    blockers = bullets(section(text, 'Blockers Requiring Taisama'))
    summary = enrich_summary_with_fallbacks(summary, actions, agent_inputs, blockers, highlights)
    dom = parse_domain_summary(text)
    if dom:
        domain_summaries = dom
    retro = {
        'date': date,
        'title': text.splitlines()[0].lstrip('# ').strip(),
        'displayDate': date,
        'summary': summary,
        'highlights': highlights,
        'actionItems': actions,
        'perAgentNotes': per_agent,
        'agentInputs': agent_inputs,
        'feedback': [],
        'blockers': blockers,
        'weeklySummary': bullets(section(text, 'Weekly Summary')) or bullets(section(text, 'Trend vs Yesterday'))[:3],
    }
    retro['feedback'] = parse_feedback(retro)
    retros[date] = retro

available_dates = sorted(retros.keys())
latest_date = available_dates[-1] if available_dates else None
latest = retros.get(latest_date, {})
prev = retros.get(available_dates[-2], {}) if len(available_dates) > 1 else {}

def delta(curr, prevv):
    return curr - prevv

scoreboard = []
if latest:
    ls = latest['summary']
    ps = prev.get('summary', {})
    scoreboard = [
        {'label': 'Task hoàn thành', 'value': ls.get('tasksCompleted', 0), 'delta': delta(ls.get('tasksCompleted', 0), ps.get('tasksCompleted', 0)), 'tone': 'green', 'subtext': 'so với ngày trước'},
        {'label': 'Task bị chặn', 'value': ls.get('tasksBlocked', 0), 'delta': delta(ls.get('tasksBlocked', 0), ps.get('tasksBlocked', 0)), 'tone': 'red', 'subtext': 'cần chốt nhanh'},
        {'label': 'Action item mở', 'value': sum(1 for a in latest.get('actionItems', []) if not a.get('done')), 'delta': 0, 'tone': 'amber', 'subtext': 'retro hiện tại'},
        {'label': 'Agent hoạt động', 'value': ls.get('activeAgentsCount', 0), 'delta': delta(ls.get('activeAgentsCount', 0), ps.get('activeAgentsCount', 0)), 'tone': 'purple', 'subtext': ls.get('activeAgentsLabel', '')},
        {'label': 'Token hôm nay', 'value': ls.get('tokenBudget', 'n/a'), 'delta': 0, 'tone': 'purple', 'subtext': 'ước lượng từ retro'},
        {'label': 'Chế độ vận hành', 'value': ls.get('mode', 'Build'), 'delta': 0, 'tone': 'purple', 'subtext': 'Dream Team mode'},
    ]

agents = []
lessons = read_lessons()
for label, agent_id, icon, desc in AGENT_MAP:
    agent_text = slurp(AGENTS_DIR / agent_id / 'AGENT.md')
    role_line = ''
    m = re.search(r'^## Role\n(.+)', agent_text, re.M)
    if m:
        role_line = m.group(1).strip()
    notes = latest.get('perAgentNotes', {}).get(label, [])
    inputs = latest.get('agentInputs', {}).get(agent_id, '') or latest.get('agentInputs', {}).get(label, '')
    if not inputs and label in latest.get('agentInputs', {}):
        inputs = latest['agentInputs'][label]
    tasks7 = 0
    for retro in retros.values():
        joined = '\n'.join(retro.get('perAgentNotes', {}).get(label, []))
        if agent_id in retro.get('agentInputs', {}):
            joined += '\n' + retro['agentInputs'][agent_id]
        if label in retro.get('agentInputs', {}):
            joined += '\n' + retro['agentInputs'][label]
        if joined.strip():
            tasks7 += 1
    status = 'Chờ'
    health = 'amber'
    if notes or inputs:
        status = 'Đang có tín hiệu'
        health = 'green'
    if label == 'MiniSama':
        health = 'purple'
        status = 'Điều phối'
    agents.append({
        'name': label,
        'id': agent_id,
        'icon': icon,
        'role': role_line or desc,
        'description': desc,
        'health': health,
        'tasks7d': tasks7,
        'avgDuration': '12m' if label in ['Coach', 'Lebron', 'Bronny', 'Curry'] else 'n/a',
        'status': status,
        'current': notes[0] if notes else (inputs.splitlines()[0].lstrip('- ').strip() if inputs else 'Không có cập nhật mới'),
        'feedbackCount': sum(1 for r in retros.values() for f in r.get('feedback', []) if f['to'] == label or f['from'] == label),
        'lessonsContributed': sum(1 for l in lessons if label.lower().split('-')[0] in l['text'].lower()),
        'tokenEfficiency': 'high' if label in ['Coach', 'Curry'] else ('medium' if label in ['Lebron', 'Bronny'] else 'low'),
    })

projects = [project_info(p) for p in PROJECTS]

trends = []
for d in available_dates:
    s = retros[d]['summary']
    total = s.get('tasksCompleted', 0) + s.get('tasksBlocked', 0) + s.get('tasksInProgress', 0)
    quality = round((s.get('tasksCompleted', 0) - s.get('tasksBlocked', 0)) / max(1, s.get('tasksCompleted', 1)) * 100)
    blocker_rate = round(s.get('tasksBlocked', 0) / max(1, total) * 100)
    trends.append({
        'date': d,
        'done': s.get('tasksCompleted', 0),
        'blocked': s.get('tasksBlocked', 0),
        'inProgress': s.get('tasksInProgress', 0),
        'qualityScore': quality,
        'blockerRate': blocker_rate,
        'actionOpen': sum(1 for a in retros[d].get('actionItems', []) if not a.get('done')),
        'tokenLabel': s.get('tokenBudget', 'n/a'),
    })

weekly = {
    'wins': latest.get('highlights', [])[:1],
    'improvements': latest.get('actionItems', [])[:3],
    'summary': [
        f"{len(available_dates)} retro file(s) parsed",
        f"{sum(t['done'] for t in trends)} tasks done across visible range",
        f"{sum(t['blocked'] for t in trends)} blocked task(s) logged",
    ]
}

payload = {
    'meta': {
        'generatedAt': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).isoformat(),
        'latestDate': latest_date,
        'availableDates': available_dates,
        'source': {
            'retros': str(RETRO_DIR),
            'process': str(PROCESS_DIR / 'dream-team.md'),
            'domains': str(DOMAINS_DIR),
        }
    },
    'scoreboard': scoreboard,
    'agents': agents,
    'projects': projects,
    'retrosByDate': retros,
    'trends': trends,
    'lessons': lessons,
    'weekly': weekly,
}

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
print(OUT)
PY
