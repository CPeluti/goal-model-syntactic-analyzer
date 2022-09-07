import {main} from '../../core/index'
const func = () => {
    return 3;
}

test('adds 1 + 2 to equal 3', () => {
    expect(func()).toBe(3);
});