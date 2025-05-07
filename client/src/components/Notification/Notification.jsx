import './Notification.css'

function Notification({ message }) {
	if (!message) return null
	return <div className='notif'>{message}</div>
}

export default Notification
