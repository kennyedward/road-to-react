import React from 'react'
import './App.css';

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/', author: 'Jordan Walke', num_comments: 3,
    points: 4,
    objectID: 0,
}, 
{
    title: 'Redux',
    url: 'https://redux.js.org/', author: 'Dan Abramov, Andrew Clark', num_comments: 2,
    points: 5,
    objectID: 1,
}, 
];

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )
  
  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [setValue])

  return [value, setValue]
}

const getAsyncStories = () => new Promise(resolve => 
  setTimeout(
    () => resolve({ data: { stories: initialStories }}), 2000)
  )

const storiesReducer = (state, action) => {
  // if (action.type === "SET_STORIES") {
  //   return action.payload
  // } else if (action.type === "REMOVE_STORY") {
  //   return state.filter(story => action.payload.objectID !== story.objectID)
  // } else throw new Error()
  switch (action.type) {
    case "SET_STORIES":
      return action.payload
    case "REMOVE_STORY":
      return state.filter(story => action.payload.objectID !== story.objectID)
    default:
      throw new Error()
  }
}

const App = () => {
const [searchTerm, setSearchTerm] = useSemiPersistentState("Search", "React")
// const [stories, setStories] = React.useState([])
const [stories, dispatchStories] = React.useReducer(storiesReducer, [])
const [isLoading, setIsLoading] = React.useState(false)
const [isError, setIsError] = React.useState(false)

React.useEffect(() => {
  setIsLoading(true)

  getAsyncStories().then(result => {
    // setStories(result.data.stories)
    dispatchStories({
      type: "SET_STORIES",
      payload: result.data.stories
    })
    setIsLoading(false)
  })
  .catch(() => setIsError(true))
}, [])

const handleRemoveStory = item => {
  // const newStories = stories.filter(story => item.objectID !== story.objectID)

  // setStories(newStories)
  dispatchStories({
    type: "REMOVE_STORY",
    payload: item
  })
}

const handleSearch = event => {
  const userSearch = event.target.value
  setSearchTerm(userSearch)
}

const searchedStories = stories.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()))
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

      {isError && <p>Something went wrong...</p>}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
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
