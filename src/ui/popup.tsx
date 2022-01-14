import React from "react"

const styles = {
  center: {display: 'flex', justifyContent: 'center', alignItems: 'center'},
  button: {
    height: '32px'
  }
}

export namespace Popup {
  interface TextboxProps {
    name: string;
    example?: string;
    defaultValue?: string;
    onInput?: (value: string) => void;
    bottomSpace?: number;
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
        <td style={{paddingBottom: this.props.bottomSpace || 20}}><div style={styles.center}>{this.props.name}</div></td>
        <td style={{paddingBottom: this.props.bottomSpace || 20}}><div style={styles.center}><input onInput={(e) => {
          if (this.props.onInput)
            this.props.onInput(e.currentTarget.value);
        }} className='main-playlistEditDetailsModal-titleInput' type='text' defaultValue={this.props.defaultValue || ""} placeholder={this.props.example || ""}></input></div></td>
      </tr>
    }
  }
  
  interface TextProps {
    text: string;
    centered?: boolean
    bottomSpace?: number;
  }

  export class Text extends React.Component<TextProps, {}> {
    constructor(props: TextProps) {
      super(props)
    }

    render() {
      return <tr>
        <td colSpan={2} style={{paddingBottom: this.props.bottomSpace || 20}}><div style={this.props.centered || true ? styles.center : {}}>{this.props.text}</div></td>
      </tr>
    }
  }

  interface ButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    bottomSpace?: number;
  }

  export class Button extends React.Component<ButtonProps, {}> {
    constructor(props: ButtonProps) {
      super(props)
    }

    render() {
      return <tr>
        <td colSpan={2} style={{paddingBottom: this.props.bottomSpace || 10}}>
          <button className="lt-popup-button" onClick={() => {if (this.props.onClick) this.props.onClick()}} disabled={this.props.disabled}>
            <span className="lt-popup-text" dir="auto">{this.props.text}</span>
          </button>
        </td>
      </tr>
    }
  }

  export function close() {
    Spicetify.PopupModal.hide()
  }

  export function create(title: string, closed: (btnPressed: string | null) => void, buttonNames: string[], content: JSX.Element[]) {
    let buttons: JSX.Element[] = []
    buttonNames.forEach((btnName) => {
      buttons.push(<button className='main-buttons-button main-button-secondary main-playlistEditDetailsModal-save' style={styles.button} type='button' onClick={() => {
        closed(btnName)
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
              return <>{elem}</>
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
