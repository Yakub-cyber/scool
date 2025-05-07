import { useEffect, useState, useRef } from 'react'
import Header from './components/Header/Header'
import Tabs from './components/Tabs/Tabs'
import Filters from './components/Filters/Filters'
import AddForm from './components/AddForm/AddForm'
import ItemList from './components/ItemList/ItemList'
import Auth from './components/Auth/Auth'
import Notification from './components/Notification/Notification'
import './App.css'

const TABS = [
	{ key: 'videos', label: 'Видео' },
	{ key: 'links', label: 'Ссылки' },
	{ key: 'notes', label: 'Заметки' },
]

const MOTIVATION_QUOTES = [
	'Учение — свет, а неучение — тьма.',
	'Каждый день — новый шаг к успеху!',
	'Знания — сила.',
	'Только начни, и ты удивишься, как далеко сможешь зайти!',
	'Сегодняшние усилия — завтрашние победы.',
]

const ACHIEVEMENTS = [
	{ count: 1, label: 'Первый шаг!' },
	{ count: 5, label: '5 записей — молодец!' },
	{ count: 10, label: '10 записей — ты на пути!' },
	{ count: 25, label: '25 записей — уверенный рост!' },
	{ count: 50, label: '50 записей — пример для других!' },
	{ count: 100, label: '100 записей — ты чемпион!' },
]

function getRandomQuote() {
	return MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]
}

function uniqueTags(items) {
	const tags = new Set()
	items.forEach(i => (i.tags || []).forEach(t => tags.add(t)))
	return Array.from(tags)
}

function getStreak() {
	const streak = JSON.parse(localStorage.getItem('scool_streak') || 'null')
	if (!streak) return { days: 0, last: null, total: 0 }
	return streak
}

function setStreak(streak) {
	localStorage.setItem('scool_streak', JSON.stringify(streak))
}

function App() {
	// --- State ---
	const [tab, setTab] = useState('videos')
	const [videos, setVideos] = useState([])
	const [links, setLinks] = useState([])
	const [notes, setNotes] = useState([])
	const [input, setInput] = useState('')
	const [inputTags, setInputTags] = useState('')
	const [editId, setEditId] = useState(null)
	const [editValue, setEditValue] = useState('')
	const [editTags, setEditTags] = useState('')
	const [quote] = useState(getRandomQuote())
	const [progress, setProgress] = useState(0)
	const [notif, setNotif] = useState(null)
	const [search, setSearch] = useState('')
	const [filterTag, setFilterTag] = useState('')
	const [filterFav, setFilterFav] = useState(false)
	const [filterPinned, setFilterPinned] = useState(false)
	const [sortDesc, setSortDesc] = useState(true)
	const [allTags, setAllTags] = useState([])
	const [streak, setStreakState] = useState(getStreak())
	const [achieved, setAchieved] = useState([])
	const [nextAch, setNextAch] = useState(null)
	const fileInputRef = useRef()
	const [theme, setTheme] = useState(
		() => localStorage.getItem('scool_theme') || 'light'
	)
	const [token, setToken] = useState(
		() => localStorage.getItem('scool_token') || ''
	)
	const [loginUser, setLoginUser] = useState('')
	const [loginPass, setLoginPass] = useState('')
	const [loginError, setLoginError] = useState('')

	// --- Data fetch ---
	const fetchAll = () => {
		const params = []
		if (search) params.push(`q=${encodeURIComponent(search)}`)
		if (filterTag) params.push(`tag=${encodeURIComponent(filterTag)}`)
		if (filterFav) params.push('favorite=1')
		if (filterPinned) params.push('pinned=1')
		const query = params.length ? '?' + params.join('&') : ''
		fetch('/api/videos' + query)
			.then(r => r.json())
			.then(setVideos)
		fetch('/api/links' + query)
			.then(r => r.json())
			.then(setLinks)
		fetch('/api/notes' + query)
			.then(r => r.json())
			.then(setNotes)
	}
	useEffect(() => {
		fetchAll()
	}, [tab, search, filterTag, filterFav, filterPinned])

	// --- Streak, Achievements, Tags, Progress ---
	useEffect(() => {
		const total = videos.length + links.length + notes.length
		setProgress(Math.min(100, total * 10))
		const tags = uniqueTags([...videos, ...links, ...notes])
		setAllTags(tags)
		// streak
		const today = new Date().toISOString().slice(0, 10)
		let s = getStreak()
		if (!s.last) {
			s = { days: total > 0 ? 1 : 0, last: total > 0 ? today : null, total }
		} else if (s.last !== today && total > 0) {
			const lastDate = new Date(s.last)
			const diff = (new Date(today) - lastDate) / (1000 * 60 * 60 * 24)
			if (diff === 1) s = { days: s.days + 1, last: today, total }
			else if (diff > 1) s = { days: 1, last: today, total }
		} else {
			s.total = total
		}
		setStreak(s)
		setStreakState(s)
		// ачивки
		const got = ACHIEVEMENTS.filter(a => total >= a.count)
		setAchieved(got)
		const next = ACHIEVEMENTS.find(a => total < a.count)
		setNextAch(next)
	}, [videos, links, notes])

	useEffect(() => {
		document.body.className = theme === 'dark' ? 'dark' : ''
		localStorage.setItem('scool_theme', theme)
	}, [theme])

	// --- Auth ---
	const handleLogin = async e => {
		e.preventDefault()
		setLoginError('')
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: loginUser, password: loginPass }),
			})
			if (!res.ok) throw new Error('Ошибка входа')
			const data = await res.json()
			setToken(data.token)
			localStorage.setItem('scool_token', data.token)
			setLoginUser('')
			setLoginPass('')
		} catch {
			setLoginError('Неверный логин или пароль')
		}
	}
	const handleLogout = () => {
		setToken('')
		localStorage.removeItem('scool_token')
	}

	// --- CRUD ---
	const handleAdd = async () => {
		if (!input.trim()) return
		let url = ''
		let body = {}
		const tags = inputTags
			.split(',')
			.map(t => t.trim())
			.filter(Boolean)
		if (tab === 'videos') {
			url = '/api/videos'
			body = { url: input, tags }
		} else if (tab === 'links') {
			url = '/api/links'
			body = { url: input, tags }
		} else {
			url = '/api/notes'
			body = { text: input, tags }
		}
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
		setInput('')
		setInputTags('')
		fetchAll()
		setNotif('Добавлено!')
		setTimeout(() => setNotif(null), 1500)
	}
	const handleDelete = async id => {
		let url = `/api/${tab}/${id}`
		await fetch(url, { method: 'DELETE' })
		fetchAll()
		setNotif('Удалено!')
		setTimeout(() => setNotif(null), 1500)
	}
	const handleEditStart = item => {
		setEditId(item.id)
		setEditValue(tab === 'notes' ? item.text : item.url)
		setEditTags((item.tags || []).join(', '))
	}
	const handleEditSave = async id => {
		let url = `/api/${tab}/${id}`
		let body = {}
		const tags = editTags
			.split(',')
			.map(t => t.trim())
			.filter(Boolean)
		if (tab === 'notes') body = { text: editValue, tags }
		else body = { url: editValue, tags }
		await fetch(url, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
		setEditId(null)
		setEditValue('')
		setEditTags('')
		fetchAll()
		setNotif('Изменено!')
		setTimeout(() => setNotif(null), 1500)
	}
	const handleEditChange = val => setEditValue(val)
	const handleEditTagsChange = val => setEditTags(val)
	const handleEditCancel = () => {
		setEditId(null)
		setEditValue('')
		setEditTags('')
	}
	const handleToggle = async (id, field, value) => {
		let url = `/api/${tab}/${id}`
		let body = { [field]: !value }
		await fetch(url, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
		fetchAll()
	}

	// --- Экспорт/импорт ---
	const handleExport = async () => {
		const res = await fetch('/api/export')
		const data = await res.json()
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'scool-data.json'
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}
	const handleImportClick = () => {
		fileInputRef.current.click()
	}
	const handleImport = async e => {
		const file = e.target.files[0]
		if (!file) return
		const text = await file.text()
		try {
			const data = JSON.parse(text)
			await fetch('/api/import', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})
			fetchAll()
			setNotif('Импортировано!')
			setTimeout(() => setNotif(null), 1500)
		} catch {
			setNotif('Ошибка импорта!')
			setTimeout(() => setNotif(null), 2000)
		}
	}

	// --- Items ---
	let items = []
	if (tab === 'videos') items = videos
	if (tab === 'links') items = links
	if (tab === 'notes') items = notes
	items = [...items].sort((a, b) =>
		sortDesc
			? new Date(b.date) - new Date(a.date)
			: new Date(a.date) - new Date(b.date)
	)

	// --- Auth render ---
	if (!token) {
		return (
			<Auth
				theme={theme}
				setTheme={setTheme}
				loginUser={loginUser}
				setLoginUser={setLoginUser}
				loginPass={loginPass}
				setLoginPass={setLoginPass}
				loginError={loginError}
				handleLogin={handleLogin}
			/>
		)
	}

	// --- Main render ---
	return (
		<div className={`container${theme === 'dark' ? ' dark' : ''}`}>
			<Header
				quote={quote}
				streak={streak}
				achieved={achieved}
				nextAch={nextAch}
				progress={progress}
				theme={theme}
				setTheme={setTheme}
				handleExport={handleExport}
				handleImportClick={handleImportClick}
				fileInputRef={fileInputRef}
				handleImport={handleImport}
				handleLogout={handleLogout}
			/>
			<Tabs tabs={TABS} tab={tab} setTab={setTab} />
			<Notification message={notif} />
			<Filters
				search={search}
				setSearch={setSearch}
				filterTag={filterTag}
				setFilterTag={setFilterTag}
				allTags={allTags}
				filterFav={filterFav}
				setFilterFav={setFilterFav}
				filterPinned={filterPinned}
				setFilterPinned={setFilterPinned}
				sortDesc={sortDesc}
				setSortDesc={setSortDesc}
				onReset={() => {
					setSearch('')
					setFilterTag('')
					setFilterFav(false)
					setFilterPinned(false)
				}}
			/>
			<AddForm
				value={input}
				onChange={setInput}
				tags={inputTags}
				onTagsChange={setInputTags}
				onAdd={handleAdd}
				placeholder={
					tab === 'notes' ? 'Новая заметка...' : 'Вставьте ссылку...'
				}
				onEnter={handleAdd}
			/>
			<ItemList
				items={items}
				tab={tab}
				editId={editId}
				editValue={editValue}
				editTags={editTags}
				onEditStart={handleEditStart}
				onEditSave={handleEditSave}
				onEditChange={handleEditChange}
				onEditTagsChange={handleEditTagsChange}
				onEditCancel={handleEditCancel}
				onDelete={handleDelete}
				onToggle={handleToggle}
			/>
			<footer className='footer'>
				<span>Scool © {new Date().getFullYear()} — Учись каждый день!</span>
			</footer>
		</div>
	)
}

export default App
