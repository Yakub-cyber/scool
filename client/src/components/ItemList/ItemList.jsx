import './ItemList.css'

function ItemList({
	items,
	tab,
	editId,
	editValue,
	editTags,
	onEditStart,
	onEditSave,
	onEditChange,
	onEditTagsChange,
	onEditCancel,
	onDelete,
	onToggle,
}) {
	if (!items.length) {
		return (
			<ul className='item-list'>
				<li className='empty'>Пока ничего нет. Добавь первый элемент!</li>
			</ul>
		)
	}
	return (
		<ul className='item-list'>
			{items.map(item => (
				<li
					key={item.id}
					className={`item${item.pinned ? ' pinned' : ''}${
						tab === 'notes' ? ' note' : ''
					}`}
				>
					{editId === item.id ? (
						<>
							<input
								type='text'
								value={editValue}
								onChange={e => onEditChange(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && onEditSave(item.id)}
							/>
							<input
								type='text'
								placeholder='Теги (через запятую)'
								value={editTags}
								onChange={e => onEditTagsChange(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && onEditSave(item.id)}
							/>
							<button onClick={() => onEditSave(item.id)}>Сохранить</button>
							<button onClick={onEditCancel}>Отмена</button>
						</>
					) : (
						<>
							{tab === 'notes' ? (
								<span>{item.text}</span>
							) : (
								<a href={item.url} target='_blank' rel='noopener noreferrer'>
									{item.url}
								</a>
							)}
							<span className='date'>
								{new Date(item.date).toLocaleString()}
							</span>
							{item.tags && item.tags.length > 0 && (
								<span className='tags'>
									{item.tags.map(t => (
										<span key={t} className='tag'>
											{t}
										</span>
									))}
								</span>
							)}
							<button onClick={() => onEditStart(item)}>✏️</button>
							<button onClick={() => onDelete(item.id)}>🗑️</button>
							<button
								onClick={() => onToggle(item.id, 'favorite', item.favorite)}
								title='Избранное'
							>
								{item.favorite ? '★' : '☆'}
							</button>
							<button
								onClick={() => onToggle(item.id, 'pinned', item.pinned)}
								title='Закрепить'
							>
								{item.pinned ? '📌' : '📍'}
							</button>
						</>
					)}
				</li>
			))}
		</ul>
	)
}

export default ItemList
