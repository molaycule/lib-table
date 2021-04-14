import 'ka-table/style.css';

import React, { useState } from 'react';
import useFetch from 'use-http';
import ReactModal from 'react-modal';
import { kaReducer, Table } from 'ka-table';
import {
  ActionType,
  DataType,
  PagingPosition,
  SortingMode
} from 'ka-table/enums';
import {
  hideLoading,
  loadData,
  setSingleAction,
  showLoading,
  updateData,
  updatePagesCount
} from 'ka-table/actionCreators';
import useSessionStorageState from './hooks/useSessionStorageState';

// initial value of the *props
const tablePropsInit = {
  columns: [
    { key: 'id', title: 'Uid', dataType: DataType.Number },
    { key: 'name', title: 'Name', dataType: DataType.String },
    { key: 'age', title: 'Age', dataType: DataType.Number },
    { key: 'editColumn', style: { width: 50 } }
  ],
  data: [],
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 10,
    pageSizes: [5, 10, 15],
    pagesCount: undefined,
    position: PagingPosition.Bottom
  },
  rowKeyField: 'id',
  sortingMode: SortingMode.Single,
  singleAction: loadData()
};

const EditButton = ({ rowData, setEditRowData, setIsOpen }) => {
  return (
    <div className='edit-cell-button'>
      <img
        src='https://komarovalexander.github.io/ka-table/static/icons/edit.svg'
        alt='Edit Row'
        title='Edit Row'
        onClick={() => {
          setEditRowData(rowData);
          setIsOpen(true);
        }}
      />
    </div>
  );
};

const App = () => {
  const { get, response } = useFetch('http://localhost:5000');
  // in this case *props are stored in the state of parent component
  const [tableProps, changeTableProps] = useSessionStorageState(
    'tableProps',
    tablePropsInit
  );
  const [editRowData, setEditRowData] = useState();
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = async action => {
    // dispatch has an *action as an argument
    // *kaReducer returns new *props according to previous state and *action, and saves new props to the state
    changeTableProps((prevState = {}) => kaReducer(prevState, action));

    if (action.type === ActionType.LoadData) {
      dispatch(showLoading());
      const result = await get(
        `/users?_page=${tableProps.paging.pageIndex + 1}&_limit=${
          tableProps.paging.pageSize
        }`
      );
      if (response.ok) {
        const pagesCount = response.headers.get('x-total-count');
        dispatch(
          updatePagesCount(Math.ceil(pagesCount / tableProps.paging.pageSize))
        );
        dispatch(updateData(result));
        dispatch(hideLoading());
        return;
      }

      dispatch(updateData([]));
      dispatch(hideLoading());
    } else if (
      action.type === ActionType.UpdatePageIndex ||
      action.type === ActionType.UpdatePageSize
    ) {
      dispatch(setSingleAction(loadData()));
    }
  };

  return (
    <>
      <Table
        {...tableProps} // ka-table UI is rendered according to props
        dispatch={dispatch} // dispatch is required for obtain new actions from the UI
        childComponents={{
          cellText: {
            content: props => {
              if (props.column.key === 'editColumn') {
                return (
                  <EditButton
                    {...props}
                    setEditRowData={setEditRowData}
                    setIsOpen={setIsOpen}
                  />
                );
              }
            }
          }
        }}
      />
      <ReactModal isOpen={isOpen}>
        <div className='grid grid-cols-6 gap-6'>
          <div className='col-span-6 sm:col-span-3'>
            <label
              htmlFor='first_name'
              className='block text-sm font-medium text-gray-700'>
              First name
            </label>
            <input
              type='text'
              name='first_name'
              id='first_name'
              className='mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm bg-gray-100 rounded-md p-2'
              value={editRowData?.name}
              onChange={e => {
                setEditRowData(prevState => ({
                  ...prevState,
                  name: e.target.name
                }));
              }}
            />
          </div>
          <div className='col-span-6 sm:col-span-3'>
            <label
              htmlFor='age'
              className='block text-sm font-medium text-gray-700'>
              Age
            </label>
            <input
              type='text'
              name='age'
              id='age'
              className='mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm bg-gray-100 rounded-md p-2'
              value={editRowData?.age}
              onChange={e => {
                setEditRowData(prevState => ({
                  ...prevState,
                  age: e.target.name
                }));
              }}
            />
          </div>
        </div>
        <button
          type='button'
          className='mt-8 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
          Save
        </button>
        <button
          type='button'
          onClick={() => {
            setIsOpen(false);
          }}
          className='mt-8 ml-4 inline-flex justify-center py-2 px-4 border border-indigo-600 shadow-sm text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-100 focus:outline-none'>
          Cancel
        </button>
      </ReactModal>
    </>
  );
};

export default App;
