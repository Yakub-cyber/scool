import './Auth.css'

function Auth({
	theme,
	setTheme,
	loginUser,
	setLoginUser,
	loginPass,
	setLoginPass,
	loginError,
	handleLogin,
}) {
	return (
		<div className={`container${theme === 'dark' ? ' dark' : ''}`}>
			<button
				className={`theme-toggle${theme === 'dark' ? ' dark' : ''}`}
				onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			>
				{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
			</button>
			<div className='login-form'>
				<h2>Вход</h2>
				<form onSubmit={handleLogin}>
					<input
						type='text'
						placeholder='Логин'
						value={loginUser}
						onChange={e => setLoginUser(e.target.value)}
						autoFocus
					/>
					<input
						type='password'
						placeholder='Пароль'
						value={loginPass}
						onChange={e => setLoginPass(e.target.value)}
					/>
					<button type='submit'>Войти</button>
				</form>
				{loginError && <div className='notif'>{loginError}</div>}
				<p style={{ marginTop: 8, color: '#888' }}>user / pass</p>
			</div>
		</div>
	)
}

export default Auth
