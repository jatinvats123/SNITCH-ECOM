import { useState } from 'react'
import './App.css'
import {RouterProvider} from 'react-router'
import {routes} from './app.routes'
function App() {

  return (
       <>
    <RouterProvider router={routes}/>
    </>
  )
}

export default App
