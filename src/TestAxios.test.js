import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import axios from 'axios'
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
 
Enzyme.configure({ adapter: new Adapter() });

import { shallow } from 'enzyme'


import ReportsIndex from './pages/ReportsIndex'

// We will be testing if all the HTTP request links work to get the correct information.

// Testing links for ReportsIndex page

describe('testing ReportsIndex', () => {
    let wrapper;
    const props = {
        sources: {"value": true}
    }
    beforeEach(() => {
        wrapper = shallow(<ReportsIndex {...props} />);
      });
    
        it('should check `componentDidMount()`', () => {
          const instance = wrapper.instance(); // you assign your instance of the wrapper
          jest.spyOn(instance, 'getSources'); // You spy on the randomFunction
          instance.componentDidMount();
          expect(instance.getSources).toHaveBeenCalledTimes(1); // You check if the condition you want to match is correct.
        });
});


//jest.mock('axios');

/**
 *test('should get all sources', () => {
    const sources = [{"enabled":false,"unreadErrorCount":0,"tags":[],"_id":"606b31a4bb1d0a5e5138d8bb","media":"twitter","nickname":"Democrats","keywords":"democrats, biden","user":{"_id":"60525f6e67764a0cbd905446","username":"admin"},"__v":1}];
    const resp = {data: sources};
    axios.get.mockResolvedValue(resp);
  
    return ReportsIndex.then(data => expect(data).toEqual(sources));
});

 */
