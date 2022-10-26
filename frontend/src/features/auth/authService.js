/* eslint-disable no-unused-vars */
import axios from 'axios'

const API_URL ='/signup' //end point for all auth stuff

//Register User
//sending post request to our backend
const register = async(userData) => {
    const response = await axios.post(API_URL, userData)
    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data)) //this may be different for passport auth
    }
    return response.data
}

const logout = async() => {
    localStorage.removeItem('user')
} 
const authService = {
    register,
    logout
}

export default authService