'use strict';
module.exports = ({ setTimeout, Error, Promise }) => {
    class TimeoutError extends Error
    {
    }

    function sleep (timeout) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    function waitFor (fun, predicate, tryCount = 10, interval = 10) {
        if (tryCount <= 0) {
            return Promise.reject(new TimeoutError());
        }
        return Promise.resolve(fun())
            .then(result => {
                if (predicate(result)) {
                    return result;
                }
                return sleep(interval).then(() =>
                    waitFor(fun, predicate, tryCount - 1, interval)
                );
            });
    }

    function waitUntil (predicate, tryCount = 10, interval = 10) {
        return waitFor(predicate, (x => x), tryCount, interval);
    }

    return {
        TimeoutError,
        sleep,
        waitFor,
        waitUntil,
    };
};
