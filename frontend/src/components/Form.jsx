import { useState, useEffect } from "react"
import api from "../api"
import { useNavigate } from "react-router-dom"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator"
import { getAuthErrorMessage } from "../utils/errorHandler"

function Form({route,method}){
    const [username,setUsername]= useState("")
    const [password,setPassword]= useState("")
    const [loading,setLoading]= useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const navigate = useNavigate()

    const name = method==="login" ? "Login" : "Register"

    useEffect(() => {
        // Check for session expired flag
        if (method === "login" && sessionStorage.getItem('sessionExpired') === 'true') {
            setError("Session expired. Please log in again.");
            sessionStorage.removeItem('sessionExpired');
        }
    }, [method]);

    const handleSubmit=async (e)=>{
        setLoading(true);
        setError("");
        setSuccess("");
        e.preventDefault();

        try{
            const res= await api.post(route, {username,password})
            if(method==="login"){
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                setSuccess("Login successful! Redirecting...");
                setTimeout(() => navigate("/"), 500);

            }else{
                setSuccess("Account created successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 1000);
            }
        }catch(error){
            const errorMessage = getAuthErrorMessage(error, method);
            setError(errorMessage);
        }finally{
            setLoading(false)
        }
    };

    return <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>
        
        {/* Cold start notice */}
        <div className="info-notice">
            <p>ℹ️ Backend is hosted on free tier. Initial requests may take 30-60 seconds while the server wakes up.</p>
        </div>

        <input
            className="form-input"
            type="text"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            placeholder="Username"
            required
        />
        <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="Password"
            required
        />
        
        {/* Error message */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Success message */}
        {success && <div className="success-message">{success}</div>}

        {loading && <LoadingIndicator />}
        <button className="form-button" type="submit" disabled={loading}>
            {loading 
                ? (method === "login" ? "Logging in..." : "Creating account...") 
                : name}
        </button>

    
    </form>

}

export default Form