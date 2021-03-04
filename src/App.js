import React from 'react'
import './App.css';


const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )
  
  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [setValue])

  return [value, setValue]
}

const App = () => {
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

console.log("stories: ", initialStories);

const [searchTerm, setSearchTerm] = useSemiPersistentState("Search", "React")
const [stories, setStories] = React.useState(initialStories)

const handleRemoveStory = item => {
  const newStories = stories.filter(story => item.objectID !== story.objectID)

  setStories(newStories)
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
        // label="Search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search</strong>
      </InputWithLabel>
      <hr />
      <List list={searchedStories} onRemoveItem={handleRemoveStory} />
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
