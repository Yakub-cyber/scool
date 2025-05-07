import './AddForm.css'

function AddForm({
	value,
	onChange,
	tags,
	onTagsChange,
	onAdd,
	placeholder,
	onEnter,
}) {
	return (
		<div className='add-form'>
			<input
				type='text'
				placeholder={placeholder}
				value={value}
				onChange={e => onChange(e.target.value)}
				onKeyDown={e => e.key === 'Enter' && onEnter()}
			/>
			<input
				type='text'
				placeholder='Теги (через запятую)'
				value={tags}
				onChange={e => onTagsChange(e.target.value)}
				onKeyDown={e => e.key === 'Enter' && onEnter()}
			/>
			<button onClick={onAdd}>Добавить</button>
		</div>
	)
}

export default AddForm
