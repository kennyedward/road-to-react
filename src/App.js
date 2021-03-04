import React from 'react'
import './App.css';


const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )
  
  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [setValue])

  console.log("value: ", value);

  return [value, setValue]
}

const App = () => {
  const stories = [
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

const [searchTerm, setSearchTerm] = useSemiPersistentState("Search", "React")

const handleSearch = event => {
  const userSearch = event.target.value
  setSearchTerm(userSearch)
}

const searchedStories = stories.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div>
      <Title />
      <Search onSearch={handleSearch} search={searchTerm} />
      <hr />
      <List list={searchedStories} />
    </div>
  );
}

const Title = () => {
  return (
    <h1>Hacker Stories</h1>
  )
}

const List = ({ list }) => list.map(({ objectID, ...item }) => (
    <Item key={objectID} {...item} />
))

const Item = ({ url, title, author, num_comments, points }) => (
  <div>
    <span>
      <a href={url}>{title}</a>
    </span>
    <span>{author}</span>
    <span>{num_comments}</span>
    <span>{points}</span>
  </div>
)

const Search = ({onSearch, search}) => (
    <>
      <label htmlFor="search">Search: </label>
      <input 
        type="text" 
        id="search" 
        onChange={onSearch} 
        value={search} 
      />
    </>
  )

export default App;
