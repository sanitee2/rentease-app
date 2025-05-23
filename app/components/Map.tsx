'use client'

import React from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import marketIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: marketIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src
})

interface MapProps {
  center?: number[],
}

const Map : React.FC<MapProps> = ({
  center
}) => {
  return (
    <MapContainer
    center={center as L.LatLngExpression || [ 9.7905028, 125.4935697]}
    zoom={center ? 17 : 18}
    scrollWheelZoom={false}
    className='h-[35vh] rounded-lg'>

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {center && (
        <Marker
          position={center as L.LatLngExpression}
        />
      )}
    </MapContainer>
  )
}

export default Map