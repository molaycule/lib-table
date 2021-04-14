import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const useSessionStorageState = (key, initialState = {}) => {
  const [state, setState] = useState(
    JSON.parse(sessionStorage.getItem(key)) || initialState
  );

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

useSessionStorageState.propTypes = {
  key: PropTypes.string.isRequired,
  initialState: PropTypes.object
};

export default useSessionStorageState;
