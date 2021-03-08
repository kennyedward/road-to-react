import React from 'react'
import axios from 'axios'
import styles from './App.module.css';

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

const handleFetchStories = React.useCallback(async () => {
  if (!searchTerm) return
  dispatchStories({ type: "STORIES_FETCH_INIT" })

  try {
    const result = await axios.get(url)

    dispatchStories({
      type: "STORIES_FETCH_SUCCESS",
      payload: result.data.hits
    })
  } catch {
    dispatchStories({ type: "STORIES_FETCH_FAILURE" })
  }
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
const handleSearchSubmit = event => {
  setUrl(`${API_ENDPOINT}${searchTerm}`)

  event.preventDefault()
}

const searchedStories = stories.data.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div className={styles.container}>
      <Title />

      <SearchForm 
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
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
    <h1 className={styles.headlinePrimary}>Hacker Stories</h1>
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
    <div className={styles.item}>
        <span style={{ width: "40%" }}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={{ width: "30%" }}>{item.author}</span>
        <span style={{ width: "10%" }}>{item.num_comments}</span>
        <span style={{ width: "10%" }}>{item.points}</span>
        <span style={{ width: "10%" }}>
          <button type="button" onClick={handleRemoveItem} className={`${styles.button} ${styles.buttonSmall}`}>
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
      <label htmlFor={id} className={styles.label}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        autoFocus={isFocused}
        onChange={onInputChange}
        className={styles.input}
      />
    </>
  )
}

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit
}) => (
  <form onSubmit={onSearchSubmit} className="searchForm">
        <InputWithLabel 
          id="search"
          value={searchTerm}
          isFocused
          onInputChange={onSearchInput}
        >
          <strong>Search</strong>
        </InputWithLabel>

        <button
          type="submit"
          disabled={!searchTerm}
          // onClick={handleSearchSubmit}
          className="button buttonLarge"
        >
          Submit
        </button>
      </form>
)

export default App;
