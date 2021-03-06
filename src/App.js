import React from 'react'
import './App.css';

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query="

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )
  
  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [setValue])

  return [value, setValue]
}

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      }
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      }
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(story => action.payload.objectID !== story.objectID)
      }
    default:
      throw new Error()
  }
}

const App = () => {
const [searchTerm, setSearchTerm] = useSemiPersistentState("Search", "React")
const [stories, dispatchStories] = React.useReducer(storiesReducer, { data: [], isLoading: false, isError: false})
const [isLoading, setIsLoading] = React.useState(false)
const [isError, setIsError] = React.useState(false)
const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`)

const handleFetchStories = React.useCallback(() => {
  if (!searchTerm) return
  dispatchStories({ type: "STORIES_FETCH_INIT" })

  fetch(url)
    .then(response => response.json())
    .then(result => {
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.hits
      })
    }, searchTerm)
  .catch(() => {
    dispatchStories({ type: "STORIES_FETCH_FAILURE" })
  })
}, [url])

React.useEffect(() => {
  handleFetchStories()
}, [handleFetchStories])

const handleRemoveStory = item => {
  dispatchStories({
    type: "REMOVE_STORY",
    payload: item
  })
}

const handleSearchInput = event => {
  const userSearch = event.target.value
  setSearchTerm(userSearch)
}
const handleSearchSubmit = () => {
  setUrl(`${API_ENDPOINT}${searchTerm}`)
}

const searchedStories = stories.data.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div>
      <Title />
      <InputWithLabel 
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearchInput}
      >
        <strong>Search</strong>
      </InputWithLabel>

      <button
        type="button"
        disabled={!searchTerm}
        onClick={handleSearchSubmit}
      >
        Submit
      </button>
      <hr />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
      
    </div>
  );
}

const Title = () => {
  return (
    <h1>Hacker Stories</h1>
  )
}

const List = ({ list, onRemoveItem }) => list.map(item => (
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
))

const Item = ({ item, onRemoveItem }) => {
  const handleRemoveItem = () => {
    onRemoveItem(item)
  }
  return (
    <div>
        <span>
          <a href={item.url}>{item.title}</a>
        </span>
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>
        <span>
          <button type="button" onClick={handleRemoveItem}>
            Dismiss
          </button>
        </span>
    </div>
  )
}

const InputWithLabel = ({ id, label, value, type = "text", onInputChange, isFocused, children }) => {
  const inputRef = React.useRef()

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        autoFocus={isFocused}
        onChange={onInputChange}
      />
    </>
  )
}

export default App;
