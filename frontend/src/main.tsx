import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './pages/App'
import Home from './pages/Home'
import Login from './pages/Login'
import CampaignList from './pages/CampaignList'
import NewCampaign from './pages/NewCampaign'
import Offers from './pages/Offers'
import Profile from './pages/Profile'
import Reviews from './pages/Reviews'

const router = createBrowserRouter([
  { path: '/', element: <App/>, children: [
      { index: true, element: <Home/> },
      { path: 'login', element: <Login/> },
      { path: 'campaigns', element: <CampaignList/> },
      { path: 'campaigns/new', element: <NewCampaign/> },
      { path: 'offers', element: <Offers/> },
      { path: 'profile', element: <Profile/> },
      { path: 'reviews', element: <Reviews/> },
  ]}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
