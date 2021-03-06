import React from 'react'
import './App.css';

// const initialStories = [
//   {
//     title: 'React',
//     url: 'https://reactjs.org/', author: 'Jordan Walke', num_comments: 3,
//     points: 4,
//     objectID: 0,
// }, 
// {
//     title: 'Redux',
//     url: 'https://redux.js.org/', author: 'Dan Abramov, Andrew Clark', num_comments: 2,
//     points: 5,
//     objectID: 1,
// }, 
// ];

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

// const getAsyncStories = () => new Promise(resolve => 
//   setTimeout(
//     () => resolve({ data: { stories: initialStories }}), 2000)
//   )

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

React.useEffect(() => {
  if (!searchTerm) return
  dispatchStories({ type: "STORIES_FETCH_INIT" })
  // setIsLoading(true)

  fetch(`${API_ENDPOINT}${searchTerm}`)
    .then(response => response.json())
    .then(result => {
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.hits
      })
    }, searchTerm)

  // getAsyncStories().then(result => {
  //   dispatchStories({
  //     type: "STORIES_FETCH_SUCCESS",
  //     payload: result.data.stories
  //   })
  //   // setIsLoading(false)
  // })
  // getAsyncStories = () => new Promise((resolve, reject) => setTimeout(reject, 2000))
  // .catch(() => setIsError(true))
  .catch(() => {
    dispatchStories({ type: "STORIES_FETCH_FAILURE" })
  })
}, [])

const handleRemoveStory = item => {
  dispatchStories({
    type: "REMOVE_STORY",
    payload: item
  })
}

const handleSearch = event => {
  const userSearch = event.target.value
  setSearchTerm(userSearch)
}

const searchedStories = stories.data.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div>
      <Title />
      <InputWithLabel 
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search</strong>
      </InputWithLabel>
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
