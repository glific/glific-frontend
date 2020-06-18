import React, { Children } from "react";
import { shallow } from 'enzyme';
import { ErrorMessage } from './ErrorMessage'
import { AlertTitle, Alert } from '@material-ui/lab';

describe('Error Message test', () => {
    const errorString = 'this is an error message'
    const createError = () => (
        <ErrorMessage error={errorString} />
    )

    it('renders component properly', () => {
        const wrapper = shallow(createError());
        expect(wrapper).toBeTruthy();
    });

    it('displays an error banner', () => {
        const wrapper = shallow(createError());
        let severityProp = wrapper.find(Alert).prop('severity')
        expect(severityProp).toEqual('error')
    })

    it('banner has title that says error', () => {
        const wrapper = shallow(createError());
        let bannerTitle = wrapper.find(AlertTitle).prop('children')
        expect(bannerTitle).toEqual('Error');
    })

    it('displays the right error message', () => {
        const wrapper = shallow(createError());
        let errorProps = wrapper.find(Alert).prop('children');
        const message = errorProps[errorProps.length - 1];
        expect(message).toEqual(errorString);
    })
});