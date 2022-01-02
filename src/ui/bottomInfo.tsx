import React from "react"

const styles = {
  textContainer: {
    fontSize: '14px',
    position: 'absolute' as 'absolute',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    left: '0',
    bottom: '0'
  }
}

export default function BottomInfo(props: {server: string, listeners: string[], loading: boolean}) {
  return <div style={styles.textContainer}>
    {
      !!props.server ? <>
        <span>{`Listen Together ${props.loading ? "trying to connect" : "connected"} to ${props.server}`}</span>
        {props.loading ? <></> : <span>{`Listeners: ${props.listeners.join(', ')}`}</span>}
      </>
      : <></>
    }
    
  </div>
}