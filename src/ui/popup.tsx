import React from "react"

const styles = {
  center: {display: 'flex', justifyContent: 'center', alignItems: 'center'},
  button: {}
}

export namespace Popup {
  interface TextboxProps {
    name: string;
    example?: string;
    defaultValue?: string;
    onInput?: (value: string) => void;
  }

  export class Textbox extends React.Component<TextboxProps, {}> {
    constructor(props: TextboxProps) {
      super(props);
      if (props.defaultValue != undefined && this.props.onInput != undefined) {
        this.props.onInput(props.defaultValue)
      }
    }

    render() {
      return <tr>
        <td><div style={styles.center}>{this.props.name}</div></td>
        <td><div style={styles.center}><input onInput={(e) => {
          if (this.props.onInput)
            this.props.onInput(e.currentTarget.value);
        }} className='main-playlistEditDetailsModal-titleInput' type='text' defaultValue={this.props.defaultValue || ""} placeholder={this.props.example || ""}></input></div></td>
      </tr>
    }
  }
  
  interface TextProps {
    text: string;
    centered?: boolean
  }

  export class Text extends React.Component<TextProps, {}> {
    constructor(props: TextProps) {
      super(props)
    }

    render() {
      return <tr>
        <td colSpan={2}><div style={this.props.centered || true ? styles.center : {}}>{this.props.text}</div></td>
      </tr>
    }
  }

  export function create(title: string, closed: (btnPressed: string | null) => void, buttonNames: string[], content: JSX.Element[]) {
    let buttons: JSX.Element[] = []
    buttonNames.forEach((btnName) => {
      buttons.push(<button className='main-buttons-button main-button-secondary main-playlistEditDetailsModal-save' style={styles.button} type='button' onClick={() => {
        closed(btnName)
        Spicetify.PopupModal.hide()
      }}>
        {btnName}
      </button>)
    })

    Spicetify.PopupModal.display({
      title: title,
      content: (<div style={styles.center}>
        <table style={{width: '100%'}}>
          {
            content.map((elem) => {
              return <>{elem}<br/></>
            })
          }
          <tr><td colSpan={2}><div style={styles.center}>
            <table style={{width: '100%'}}>
              <tr>{
                buttons.map((btn) => {
                  return <td><div style={styles.center}>{btn}</div></td>
                })
              }</tr>
            </table>
          </div></td></tr>
        </table>
      </div>) as any
    })
  }
}
