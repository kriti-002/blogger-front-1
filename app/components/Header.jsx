import React, {useState,useContext} from "react";
import {Link} from "react-router-dom";
import StateContext from '../StateContext.jsx'

// Imported Components---->>
import HeaderLoggedOut from "./HeaderLoggedOut.jsx"
import HeaderLoggedIn from './HeaderLoggedIn.jsx'
// Components----->>
function Header(props){
  const appState = useContext(StateContext)
  
    return (<header className="header-bar bg-primary mb-3">
    <div className="container d-flex flex-column flex-md-row align-items-center p-3">
      <h4 className="my-0 mr-md-auto font-weight-normal">
        <Link to="/" className="text-white">
          BloggerApp
        </Link>
      </h4>
      {appState.loggedIn ? <HeaderLoggedIn  /> : <HeaderLoggedOut  />}
    </div>
  </header>)
}
export default Header;