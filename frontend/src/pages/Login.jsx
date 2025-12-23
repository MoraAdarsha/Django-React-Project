import Form from '../components/Form'
import { Link } from 'react-router-dom'
import '../styles/Form.css'

function Login(){
    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Welcome to Notes!</h2>
            <Form route="/api/token/" method="login" />
            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#666' }}>
                Didn't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>Register</Link>
            </p>
        </div>
    )
}

export default Login