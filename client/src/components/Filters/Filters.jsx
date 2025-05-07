import './Filters.css'

function Filters({
	search,
	setSearch,
	filterTag,
	setFilterTag,
	allTags,
	filterFav,
	setFilterFav,
	filterPinned,
	setFilterPinned,
	sortDesc,
	setSortDesc,
	onReset,
}) {
	return (
		<div className='filters'>
			<input
				type='text'
				placeholder='Поиск...'
				value={search}
				onChange={e => setSearch(e.target.value)}
			/>
			<select value={filterTag} onChange={e => setFilterTag(e.target.value)}>
				<option value=''>Все теги</option>
				{allTags.map(tag => (
					<option key={tag} value={tag}>
						{tag}
					</option>
				))}
			</select>
			<label>
				<input
					type='checkbox'
					checked={filterFav}
					onChange={e => setFilterFav(e.target.checked)}
				/>
				Избранное
			</label>
			<label>
				<input
					type='checkbox'
					checked={filterPinned}
					onChange={e => setFilterPinned(e.target.checked)}
				/>
				Закреплённое
			</label>
			<button onClick={() => setSortDesc(s => !s)}>
				{sortDesc ? '↓ Новые' : '↑ Старые'}
			</button>
			<button onClick={onReset}>Сбросить</button>
		</div>
	)
}

export default Filters
