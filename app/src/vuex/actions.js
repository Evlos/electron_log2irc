import * as types from './mutation-types'

export const decrementMain = ({ dispatch }) => {
  dispatch(types.DECREAMENT_MAIN_COUNTER)
}

export const incrementMain = ({ dispatch }) => {
  dispatch(types.INCREAMENT_MAIN_COUNTER)
}
