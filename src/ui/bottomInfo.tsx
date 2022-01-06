import React from "react"

const styles = {
  textContainer: {
    fontSize: '14px',
    position: 'absolute' as 'absolute',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    left: '0',
    bottom: '0',
    maxHeight: '22px'
  }
}

export default function BottomInfo(props: {server: string, listeners?: [{name: string, isHost: boolean, watchingAD: boolean}], loading?: boolean}) {
  return <div style={styles.textContainer}>
    {
      !!props.server ? <>
        <span style={{maxHeight: '22px', overflow: 'hidden', maxWidth: '50%'}}>{`Listen Together ${props.loading ? "trying to connect" : "connected"} to ${props.server}`}</span>

        {props.loading ? <></> : <span style={{maxHeight: '22px', overflow: 'hidden', maxWidth: '50%'}}>{`Listeners: `} {
          props.listeners ? props.listeners.map((listener, i) => {
            let color = ""
            let title = "Listener"
            if (listener.isHost && listener.watchingAD) {
              color = "Gold"; 
              title = "Host and watching an AD"
            } else if (listener.watchingAD) {
              color = "LimeGreen";
              title = "Watching an AD";
            } else if (listener.isHost) {
              color = "Orange";
              title = "Host";
            }

            return <span key={i} title={title} style={{color: color}}>{listener.name + (i !== props.listeners!.length-1 ? ", " : "")}</span>
          }) : ""
        }
        </span>}
        
      </>
      : <></>
    }
    
  </div>
}