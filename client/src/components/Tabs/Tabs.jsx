import './Tabs.css'

function Tabs({ tabs, tab, setTab }) {
	return (
		<nav className='tabs'>
			{tabs.map(t => (
				<button
					key={t.key}
					className={tab === t.key ? 'active' : ''}
					onClick={() => setTab(t.key)}
				>
					{t.label}
				</button>
			))}
		</nav>
	)
}

export default Tabs
