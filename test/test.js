'use strict';

const assert = require('power-assert');
const {
    TimeoutError,
    sleep,
    waitFor,
    waitUntil,
} = require('../index.js')(global);

describe('TimeoutError', function () {
    it('is Error', function () {
        assert(new TimeoutError instanceof Error);
    });
});

describe('sleep', function () {
    it('should return a promise', function () {
        assert(sleep(1) instanceof Promise);
    });

    it('should be resolved after X ms', function () {
        const t = Date.now();
        return sleep(300).then(() => {
            const dt = Date.now() - t;
            assert(300 <= dt && dt < 330);
        });
    });
});

describe('waitUntil', function () {
    it('should return a promise', function () {
        assert(waitUntil(() => false) instanceof Promise);
    });

    it('should be resolved when predicate returns true', () =>
        waitUntil(() => true)
    );

    it('should accept promise-return predicates', () =>
        waitUntil(() => Promise.resolve(1))
    );

    it('should be rejected after timeout', () =>
        waitUntil(() => false).then(
            () => assert(false),
            err => assert(err instanceof TimeoutError)
        )
    );

    it('can change the number of trials', function () {
        let i = 0;
        return waitUntil(() => ++i === 30, 30);
    });

    it('can change trial interval', function () {
        const t = Date.now();
        return waitUntil(
            () => false,
            1 /* time */,
            100 /* ms interval */
        ).then(
            () => assert(false),
            err => {
                const dt = Date.now() - t;
                assert(err instanceof TimeoutError);
                assert(100 <= dt && dt < 130);
            }
        );
    });
});

describe('waitFor', function () {
    it('should return a promise', function () {
        const f = () => 1;
        const g = x => x === 0;
        assert(waitFor(f, g) instanceof Promise);
    });

    it('should be resolved with result when predicate returns true', () =>
        waitFor(() => 1, x => x === 1)
            .then(x => assert(x === 1))
    );

    it('should accept promise-return functions', () =>
        waitFor(() => Promise.resolve(1), x => x === 1)
            .then(x => assert(x === 1))
    );

    it('should try repeatedly until timeout', function () {
        let i = 0;
        return waitFor(
            () => ++i,
            x => x === 5,
            5 /* times */,
            1 /* ms interval */
        ).then(x => assert(x === 5));
    });

    it('should be rejected after timeout', () =>
        waitFor(() => 1, x => x === 0).then(
            () => assert(false),
            err => assert(err instanceof TimeoutError)
        )
    );
});
