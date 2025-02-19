import React, { useEffect, useContext } from "react"
import DispatchContext from '../DispatchContext.jsx'
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";

function Search() {
  const appDispatch = useContext(DispatchContext)
  const [state,setState] = useImmer({
    searchTerm:'',
    results:[],
    show:"neither",
    requestCount:0
  })

  function handleCloseSearch(){
    appDispatch({type:'closeSearch'})
  }
  useEffect(() => {
    document.addEventListener('keyup', searchKeyPressHandler)
    return () => document.removeEventListener('keyup', searchKeyPressHandler)
  }, [])
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = 'loading'
      }) 
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 500);
      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        draft.show = 'neither'
      })
    }
  }, [state.searchTerm])

  useEffect(() => {   
    if (state.requestCount){
      // send axios request here 
      const ourRequest = Axios.CancelToken.source()
      async function fetchResult(params) {
        try {
          const response = await Axios.post('/search',{searchTerm:state.searchTerm},{CancelToken: ourRequest.token})
          setState(draft => {
            draft.results = response.data
            draft.show = 'results'
          } )
          
        } catch (e) {
          console.log('there was a problem or request was cancelled.');
          
        }
      }
      fetchResult()
      return () => {ourRequest.cancel()}    
    }
  }, [state.requestCount])

  function searchKeyPressHandler(e){
    if (e.keyCode == 27) {
      handleCloseSearch()
    }
  }
  function handleInput(e) {
    const value = e.target.value 
    setState(draft => {
      draft.searchTerm = value.trim()
    })
  }
  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={handleCloseSearch} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == 'loading' ? "circle-loader--visible" : '')}></div>
          <div className={"live-search-results " + (state.show == 'results' ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
              <div className="list-group-item active"><strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "Items" : "Item"} found)</div>
              {state.results.map(item => {
                const date = new Date(item.createdDate);
                const dateFormatted = date.getDate()+"/"+(date.getMonth()+1)+'/'+date.getFullYear();
                return (
                    <Link onClick={handleCloseSearch} key={item._id} to={`/post/${item._id}`} className="list-group-item list-group-item-action">
                        <img className="avatar-tiny" src={item.author.avatar} /> <strong>{item.title}</strong> {' '}
                <span className="text-muted small">by {item.author.username} on {dateFormatted} </span>
                    </Link>
                )
            })}
            </div>
            )}
            {!Boolean(state.results.length) && <p className='alert alert-danger text-center shadow-sm'>Sorry, we couldn't find any results for that search.</p>}
          </div>
        </div>
      </div>
    </>
  )
}

export default Search