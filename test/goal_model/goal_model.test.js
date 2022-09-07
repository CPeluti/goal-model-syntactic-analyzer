const func = () => {
    return 3;
}

test('adds 1 + 2 to equal 3', () => {
    expect(func(1, 2)).toBe(3);
});