import React from 'react'
import axios from 'axios'
// import styles from './App.module.css';
import styled from 'styled-components'

const StyledContainer = styled.div`
    height: 100vw;
    padding: 20px;

    background: #83a4d4;
    background: linear-gradient(to left, #b6fbff, #83a4d4);

    color: #171212;
`

const StyledHeadlinePrimary = styled.h1`
    font-size: 48px;
    font-weight: 300;
    letter-spacing: 2px;
`

const StyledItem = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 5px;
`

const StyledColumn = styled.span`
    padding: 0 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    a {
      color: inherit;
    }

    width: ${props => props.width}
`

const StyledButton =  styled.button`
    background: transparent;
    border: 1px solid #171212;
    padding: 5px;
    cursor: pointer;

    transition: all 0s 0.1s ease-in;

    &:hover {
      background: #171212;
      color: #FFFFFF;
    }
`

const StyledButtonSmall = styled(StyledButton)`
    padding: 5px;
`

const StyledButtonLarge = styled(StyledButton)`
    padding: 10px;
`

const StyledSearchForm = styled.form`
    padding: 10px 0 20px 0;
    display: flex;
    align-items: baseline;
`

const StyledLabel = styled.label`
    border-top: 1px solid #171212;
    border-left: 1px solid #171212;
    padding-left: 5px;
    font-size: 24px;
`

const StyledInput = styled.input`
    border: none;
    border-bottom: 1px solid #171212;
    border-color: transparent;
    font-size: 24px;
`

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
    // <div className={styles.container}>
    <StyledContainer>
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
      
    {/* </div> */}
    </StyledContainer>
  );
}

const Title = () => {
  return (
    // <h1 className={styles.headlinePrimary}>Hacker Stories</h1>
    <StyledHeadlinePrimary>Hacker Stories</StyledHeadlinePrimary>
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
    // <div className={styles.item}>
    <StyledItem>
        {/* <span style={{ width: "40%" }}> */}
        <StyledColumn width="40%">
          <a href={item.url}>{item.title}</a>
        {/* </span> */}
        </StyledColumn>
        {/* <span style={{ width: "30%" }}>{item.author}</span>
        <span style={{ width: "10%" }}>{item.num_comments}</span>
        <span style={{ width: "10%" }}>{item.points}</span>
        <span style={{ width: "10%" }}>
          <button type="button" onClick={handleRemoveItem} className={`${styles.button} ${styles.buttonSmall}`}>
            Dismiss
          </button>
        </span> */}
        <StyledColumn width="30%">{item.author}</StyledColumn>
        <StyledColumn width="10%">{item.num_comments}</StyledColumn>
        <StyledColumn width="10%">{item.points}</StyledColumn>
        <StyledColumn width="10%">
          {/* <button type="button" onClick={handleRemoveItem} className={`${styles.button} ${styles.buttonSmall}`}>
            Dismiss
          </button> */}
          <StyledButtonSmall type="button" onClick={handleRemoveItem}>
            Dismiss
          </StyledButtonSmall>
        </StyledColumn>
    {/* </div> */}
    </StyledItem>
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
      {/* <label htmlFor={id} className={styles.label}>{children}</label> */}
      <StyledLabel htmlFor={id}>{children}</StyledLabel>
      &nbsp;
      {/* <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        autoFocus={isFocused}
        onChange={onInputChange}
        className={styles.input}
      /> */}
      <StyledInput
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

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit
}) => (
  // <form onSubmit={onSearchSubmit} className="searchForm">
  <StyledSearchForm onSubmit={onSearchSubmit}>
        <InputWithLabel 
          id="search"
          value={searchTerm}
          isFocused
          onInputChange={onSearchInput}
        >
          <strong>Search</strong>
        </InputWithLabel>

        {/* <button
          type="submit"
          disabled={!searchTerm}
          // onClick={handleSearchSubmit}
          className="button buttonLarge"
        >
          Submit
        </button> */}
        <StyledButtonLarge
          type="submit"
          disabled={!searchTerm}
        >
          Submit
        </StyledButtonLarge>
      {/* </form> */}
      </StyledSearchForm>
)

export default App;
