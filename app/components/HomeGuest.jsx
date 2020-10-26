import React, {useEffect,useState,useContext} from "react";
import Page from "./Page.jsx";
import Axios from 'axios'
import {useImmerReducer} from 'use-immer'
import {CSSTransition} from 'react-transition-group'
import StateContext from "../StateContext.jsx"
import DispatchContext from '../DispatchContext.jsx'

function HomeGuest(){
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  // const [username, setUsername] = useState()
  // const [email, setEmail] = useState()
  // const [password, setPassword] = useState()
  const initialState = {
    username:{
      value : "",
      hasError:false,
      message:"",
      isUnique:false,
      checkCount:0
    },
    email:{
      value : "",
      hasError:false,
      message:"",
      isUnique:false,
      checkCount:0
    },
    password:{
      value : "",
      hasError:false,
      message:""
    },
    submitCount:0
  }
  

  function ourReducer(draft,action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasError = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasError = true
          draft.username.message = "Username can't exceed 30 characters."
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasError = true
          draft.username.message = "Username can only contain letters and numbers."
        }
        break;
      case 'usernameAfterDelay':
        if (draft.username.value.length < 3) {
          draft.username.hasError = true
          draft.username.message = "Username must be 3 character."
        }
        if (!draft.username.hasError && !action.noRequest) {
          draft.username.checkCount++
        }
        break;
      case 'usernameUniqueResults':
        if (action.value) {
          draft.username.hasError = true
          draft.username.message = "Username not available." 
        } else {
          draft.username.isUnique = true
        }
        break;
      case 'emailImmediately':
        draft.email.hasError = false
        draft.email.value = action.value
        break
      case 'emailAfterDelay':
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasError = true
          draft.email.message = 'You must provide a valid email address.'
        }
        if (!draft.email.hasError && !action.noRequest) {
          draft.email.checkCount++
        }
        break
      case 'emailUniqueResults':
        if (action.value) {
          draft.email.hasError= true
          draft.email.isUnique = false
          draft.email.message = "That email is already been used."
        }else{
          draft.email.isUnique = true
        }
        break
      case 'passwordImmediately':
        draft.password.hasError = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasError = true
          draft.password.message = "Password can't exceed 50 characters."
        }
        break
      case 'passwordAfterDelay':
        if (draft.password.value.length < 12){
          draft.password.hasError = true
          draft.password.message = "Password must be atleast 12 characters."
        }
        break;
      case 'submit':
        if (!draft.email.hasError && !draft.username.hasError && !draft.password.hasError && draft.username.isUnique && draft.email.isUnique) {
         draft.submitCount++ 
        }
        break
    }
  }
  const [state,dispatch] = useImmerReducer(ourReducer,initialState)
  useEffect(() => {
    if (state.username.value){
      const delay = setTimeout(() => dispatch({type:'usernameAfterDelay'}),800)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])
  useEffect(() => {
    if (state.email.value){
      const delay = setTimeout(() => dispatch({type:'emailAfterDelay'}),800)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])
  useEffect(() => {
    if (state.password.value){
      const delay = setTimeout(() => dispatch({type:'passwordAfterDelay'}),800)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])
  useEffect(() => {   
    if (state.username.checkCount){
      // send axios request here 
      const ourRequest = Axios.CancelToken.source()
      async function fetchResult(params) {
        try {
          const response = await Axios.post('/doesusernameExist',{username:state.username.value},{CancelToken: ourRequest.token})
          dispatch({type:'usernameUniqueResults', value:response.data})
          
        } catch (e) {
          console.log('there was a problem or request was cancelled.');
          
        }
      }
      fetchResult()
      return () => {ourRequest.cancel()}    
    }
  }, [state.username.checkCount])
  useEffect(() => {   
    if (state.email.checkCount){
      // send axios request here 
      const ourRequest = Axios.CancelToken.source()
      async function fetchResult(params) {
        try {
          const response = await Axios.post('/doesEmailExist',{email:state.email.value},{CancelToken: ourRequest.token})
          dispatch({type:'emailUniqueResults', value:response.data})
        } catch (e) {
          console.log('there was a problem or request was cancelled.');
          
        }
      }
      fetchResult()
      return () => {ourRequest.cancel()}    
    }
  }, [state.email.checkCount])
  useEffect(() => {   
    if (state.submitCount){
      // send axios request here 
      const ourRequest = Axios.CancelToken.source()
      async function fetchResult(params) {
        try {
          console.log("fetching");
          
          const response = await Axios.post('/register',{username:state.username.value,
          email: state.email.value, password: state.password.value},{CancelToken: ourRequest.token})
          appDispatch({type:'login', data:response.data})
          appDispatch({type:'flashMessages',value:"Congrats, Welcome to your new account."})          
        } catch (e) {
          console.log('there was a problem or request was cancelled.');
          
        }
      }
      fetchResult()
      return () => {ourRequest.cancel()}    
    }
  }, [state.submitCount])
  function handleSubmit(e){
    e.preventDefault()
    dispatch({type:'usernameImmedaitely',value:state.username.value})
    dispatch({type:'usernameAfterDelay',value:state.username.value, noRequest:true})
    dispatch({type:'emailImmedaitely',value:state.email.value})
    dispatch({type:'emailAfterDelay',value:state.email.value, noRequest:true})
    dispatch({type:'passwordImmedaitely',value:state.password.value})
    dispatch({type:'passwordAfterDelay',value:state.password.value})
    dispatch({type:'submit'})
    console.log("i called");
    
  }
  return (
    <Page title="Home" wide={true}>
    <div className="row align-items-center">
      <div className="col-lg-7 py-3 py-md-5">
        <h1 className="display-3">Remember Writing?</h1>
        <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
      </div>
      <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
        <form  onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username-register" className="text-muted mb-1">
              <small>Username</small>
            </label>
            <input onChange={(e) => dispatch({type:'usernameImmediately',value:e.target.value})} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
            <CSSTransition in={state.username.hasError} timeout={330} classNames='liveValidateMessage' unmountOnExit>
              <div className='alert alert-danger small liveValidateMessage'>{state.username.message}</div>
            </CSSTransition>
          </div>
          <div className="form-group">
            <label htmlFor="email-register" className="text-muted mb-1">
              <small>Email</small>
            </label>
            <input onChange={(e) => dispatch({type:'emailImmediately',value:e.target.value})} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
            <CSSTransition in={state.email.hasError} timeout={330} classNames='liveValidateMessage' unmountOnExit>
              <div className='alert alert-danger small liveValidateMessage'>{state.email.message}</div>
            </CSSTransition>
          </div>
          <div className="form-group">
            <label htmlFor="password-register" className="text-muted mb-1">
              <small>Password</small>
            </label>
            <input onChange={(e) => dispatch({type:'passwordImmediately',value:e.target.value})}  id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
            <CSSTransition in={state.password.hasError} timeout={330} classNames='liveValidateMessage' unmountOnExit>
              <div className='alert alert-danger small liveValidateMessage'>{state.password.message}</div>
            </CSSTransition>
          </div>
          <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
            Sign up For BloggerApp
          </button>
        </form>
      </div>
    </div>
  </Page>
  );
}
export default HomeGuest;