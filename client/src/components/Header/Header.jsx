import './Header.css'

function Header({
	quote,
	streak,
	achieved,
	nextAch,
	progress,
	theme,
	setTheme,
	handleExport,
	handleImportClick,
	fileInputRef,
	handleImport,
	handleLogout,
}) {
	return (
		<header className='header'>
			<h1>Scool</h1>
			<div className='motivation'>{quote}</div>
			<div className='streak-achievements'>
				<div className='streak'>🔥 Дней подряд: {streak.days}</div>
				<div className='achievements'>
					{achieved.map(a => (
						<span key={a.count} className='ach'>
							{a.label}
						</span>
					))}
					{nextAch && (
						<span className='next-ach'>
							До следующей ачивки: {nextAch.count - streak.total} записей
						</span>
					)}
				</div>
			</div>
			<div className='progress-bar'>
				<div className='progress' style={{ width: `${progress}%` }} />
			</div>
			<div className='progress-label'>Твой прогресс: {progress}%</div>
			<div className='export-import'>
				<div className='header-actions'>
					<button onClick={handleExport}>Экспорт</button>
					<button onClick={handleImportClick}>Импорт</button>
					<input
						type='file'
						accept='.json,application/json'
						style={{ display: 'none' }}
						onChange={handleImport}
						ref={fileInputRef}
					/>
					<button
						className={`theme-toggle${theme === 'dark' ? ' dark' : ''}`}
						onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					>
						{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
					</button>
					<button className='theme-toggle logout-btn' onClick={handleLogout}>
						Выйти
					</button>
				</div>
			</div>
		</header>
	)
}

export default Header
