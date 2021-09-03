I saw a question recently in a Udemy course I'm currently enrolled in. Brag (or maybe not): I have not paid for a course that I haven't gotten at least 25% through! Anyways, this question dealt with the Javascript event loop, in a sneaky way. The code in question looked something like this (purposely avoiding specifics so as to not out someone):
<br/><br/>

```
axios.get('/some-resource').then(response => {
    { content, id } = response.data;
    showMeSomeData(content, id);
})

const showMeSomeData = (content, id) => {
    console.log(`This data is ${content} with ID of ${id});
}
```

<br/><br/>
In case you're unfamiliar with [axios](https://www.npmjs.com/package/axios), it's a promise based HTTP client for the browser and Node. In plain english, you can make calls to APIs with it. 
<br/><br/>
In most instances, code similar to what is above will throw an error. I personally paused a little bit, as I'm not used to seeing an API call with axios not using async/await syntax. With async/await, Javascript will pause execution of the current script until the promise is resolved. Not only that, but the arrow function was defined AFTER the call with axios. With arrow functions being similar to function expressions, showMeSomeData should not have been hoisted. So, getting back to the question, how did the code work?
<br/><br/>
Javascript runs the code from the top of the file down. axios.get() is called. If we remember from the documentation, axios is promise based. That means that when axios.get() is called, it returns a promise. Because axios.get() is returning a promise, Javascript goes onto the next expression in the call stack. That next expression is declaring the arrow function showMeSomeData. This function now has a place in Javascript memory; it's been initialized. 
<br/><br/>
Once Javascript is finished with the showMeSomeData definition, it has reached the end of it's current call stack. It's now going to re-traverse the [event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop) to see if any operations it set to "pending" have been completed, such as promises, setTimeouts, setIntervals, etc. At this point, the axios.get() promise has resolved. Axios can now pass it's result to .then(), allowing .then() to call it's callback function. Because Javascript previously was able to define showMeSomeData, .then() can run the function _despite it not being hoisted_.
<br/><br/>
We can simulate this behavior with a few simple functions. Create a file simply named **index.js**. In index.js, let's make both a setTimeout function and a function that logs something to the console. 
<br/><br/>

```
setTimeout(function() {
    killHarry();
}, 30);

const killHarry = () => {
    console.log("Avada Kedavra");
}
```
<br/><br/>

Here, setTimeout is going to get invoked immediately. Because it has to wait 30 milliseconds to call killHarry, Javascript puts it away for now and continues executing expressions in it's call stack. killHarry is defined, and now Javascript has gotten to the end of the file. It realizes that, upon going through the event loop again, that the 30 milliseconds has passed, and it can now call killHarry. In your terminal, run node index.js. I'm sorry Harry.
<br/><br/>

```
Avada Kedavra
```
<br/><br/>

We already walked through a similar example with the axios.get() call. But perhaps to truly see the call stack and event loop in action, let's see if there is any way we can save Harry. After all (SPOILER ALERT!), he did die once in the books to Voldemort. Let's make our index.js look like this now:
<br/><br/>

```
setTimeout(function() {
    killHarry();
}, 30);

const killHarry = () => {
    console.log("Avada Kedavra");
}

const disarmVoldemort = () => {
    console.log("Expelliarmus");
}

disarmVoldemort();
```
<br/><br/>

Now if we run node index.js, we see what may be a surprise to some:
<br/><br/>

```
Expelliarmus
Avada Kedavra
```
<br/><br/>

Even though disarmVoldemort is the last function called on the page, it's the first to log to the console. This is the call stack and event loop in action. setTimeout is caled first, setting a timer of 30 milliseconds. We already know that killHarry is then defined in Javascript's memory. Next, disarmVoldemort is defined, followed by disarmVoldemort being called. Once disarmVoldemort is executed, Javascript circles back on it's event loop and, seeing that 30 milliseconds have passed, calls the killHarry function inside of setTimeout.
<br/><br/>
Let's say that our code instead is the same as listed below. What do you think the result would be?
<br/><br/>

```
setTimeout(function() {
    killHarry();
}, 30);

const killHarry = () => {
    console.log("Avada Kedavra");
}

disarmVoldemort();

const disarmVoldemort = () => {
    console.log("Expelliarmus");
}
```
<br/><br/>

If you run node index.js, you'll get an error. Why, what's the difference? 
<br/><br/>
The difference is that our call to disarmVoldemort happens before disarmVoldemort gets defined in the call stack. There isn't a promise attached to this call, and it's not being delayed by a setTimeout or setInterval. It's just being called.
<br/><br/>
Going back to where we called disarmVoldemort after declaring it, let's really test the call stack/event loop. Let's make our index.js look like this:
<br/><br/>

```
setTimeout(function() {
    killHarry();
}, 1);

const killHarry = () => {
    console.log("Avada Kedavra");
}

// disarmVoldemort();

const disarmVoldemort = () => {
    console.log("Expelliarmus");
}

disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
disarmVoldemort();
```
<br/><br/>

And running node index.js will give us:
<br/><br/>

```
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Expelliarmus
Avada Kedavra
```
<br/><br/>

Even though killHarry is only delayed by 1 millisecond, and disarmVoldemort is called 20-25 times, killHarry is still called last because of the event loop. It gets taken out of the call stack, placed inside of a timer, and doesn't get called until Javascript empties it's current call stack and comes back to it in the event loop.
<br/><br/>
Before we end, let's truly have a little bit of fun with this, and actually save Harry. 
<br/><br/>

```
setTimeout(function() {
    killHarry(isDisarmed);
}, 50);

const killHarry = (disarmed) => {
    if (disarmed) {
        console.log("Goodbye, Voldemort");
    } else {
        console.log("Avada Kedavra");
    }
}

// disarmVoldemort();
let isDisarmed = false;

const disarmVoldemort = () => {
    isDisarmed = true;
}

disarmVoldemort();

// prints "Goodbye, Voldemort"
```
<br/><br/>

Thanks for taking the time to read this, and I hope you enjoyed!