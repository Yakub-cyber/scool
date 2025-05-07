const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 5000

app.use(cors())
app.use(bodyParser.json())

// Пути к файлам данных
const DATA_PATH = path.join(__dirname, 'data')
const VIDEOS_FILE = path.join(DATA_PATH, 'videos.json')
const LINKS_FILE = path.join(DATA_PATH, 'links.json')
const NOTES_FILE = path.join(DATA_PATH, 'notes.json')

// Убедиться, что папка data существует
if (!fs.existsSync(DATA_PATH)) {
	fs.mkdirSync(DATA_PATH)
}

// Хелпер для чтения и записи файлов
function readData(file) {
	if (!fs.existsSync(file)) return []
	return JSON.parse(fs.readFileSync(file, 'utf-8'))
}
function writeData(file, data) {
	fs.writeFileSync(file, JSON.stringify(data, null, 2))
}
function getNextId(items) {
	return items.length ? Math.max(...items.map(i => i.id || 0)) + 1 : 1
}

// Универсальный CRUD-роутер
function createCrudRoutes(entity, file, fields = ['id']) {
	// GET (все, с фильтрацией)
	app.get(`/api/${entity}`, (req, res) => {
		let items = readData(file)
		// Фильтрация по тегу, избранному, поиску
		const { tag, favorite, pinned, q } = req.query
		if (tag) items = items.filter(i => (i.tags || []).includes(tag))
		if (favorite) items = items.filter(i => !!i.favorite)
		if (pinned) items = items.filter(i => !!i.pinned)
		if (q) {
			const ql = q.toLowerCase()
			items = items.filter(
				i =>
					(i.text && i.text.toLowerCase().includes(ql)) ||
					(i.url && i.url.toLowerCase().includes(ql))
			)
		}
		res.json(items)
	})
	// GET по id
	app.get(`/api/${entity}/:id`, (req, res) => {
		const items = readData(file)
		const item = items.find(i => i.id == req.params.id)
		if (!item) return res.status(404).json({ error: 'Not found' })
		res.json(item)
	})
	// POST (создать)
	app.post(`/api/${entity}`, (req, res) => {
		const items = readData(file)
		const now = new Date().toISOString()
		const id = getNextId(items)
		const base = {
			id,
			date: now,
			tags: req.body.tags || [],
			favorite: !!req.body.favorite,
			pinned: !!req.body.pinned,
		}
		let item = {}
		if (entity === 'notes') item = { ...base, text: req.body.text || '' }
		if (entity === 'videos' || entity === 'links')
			item = { ...base, url: req.body.url || '' }
		items.push(item)
		writeData(file, items)
		res.status(201).json(item)
	})
	// PUT (обновить)
	app.put(`/api/${entity}/:id`, (req, res) => {
		const items = readData(file)
		const idx = items.findIndex(i => i.id == req.params.id)
		if (idx === -1) return res.status(404).json({ error: 'Not found' })
		const old = items[idx]
		const updated = {
			...old,
			...req.body,
			id: old.id, // id не меняем
			date: old.date, // дата создания не меняется
		}
		items[idx] = updated
		writeData(file, items)
		res.json(updated)
	})
	// DELETE (удалить)
	app.delete(`/api/${entity}/:id`, (req, res) => {
		let items = readData(file)
		const idx = items.findIndex(i => i.id == req.params.id)
		if (idx === -1) return res.status(404).json({ error: 'Not found' })
		const [removed] = items.splice(idx, 1)
		writeData(file, items)
		res.json({ success: true, removed })
	})
}

createCrudRoutes('videos', VIDEOS_FILE)
createCrudRoutes('links', LINKS_FILE)
createCrudRoutes('notes', NOTES_FILE)

// Экспорт всех данных
app.get('/api/export', (req, res) => {
	const videos = readData(VIDEOS_FILE)
	const links = readData(LINKS_FILE)
	const notes = readData(NOTES_FILE)
	res.json({ videos, links, notes })
})
// Импорт всех данных (перезапись)
app.post('/api/import', (req, res) => {
	const { videos, links, notes } = req.body
	if (Array.isArray(videos)) writeData(VIDEOS_FILE, videos)
	if (Array.isArray(links)) writeData(LINKS_FILE, links)
	if (Array.isArray(notes)) writeData(NOTES_FILE, notes)
	res.json({ success: true })
})

// Заготовка для авторизации (очень простая, для примера)
let fakeUser = { username: 'user', password: 'pass', token: '12345' }
app.post('/api/login', (req, res) => {
	const { username, password } = req.body
	if (username === fakeUser.username && password === fakeUser.password) {
		return res.json({ token: fakeUser.token })
	}
	res.status(401).json({ error: 'Invalid credentials' })
})

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
