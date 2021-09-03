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