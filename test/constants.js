function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}


define('owner', '0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a');
define('newOwner', '0xf1f42f995046e67b79dd5ebafd224ce964740da3');
define('trader', '0xd646e8c228bfcc0ec6067ad909a34f14f45513b0');
define('investor', '0xd646e8c228bfcc0ec6067ad909a34f14f45513b0');
define('investor1', '0xddddddddddddddddddddddddddddddddddddddd1');

define('decimals', 8);
define('totalSupply', 1000000000 * Math.pow(10, this.decimals));
define('foundationTokens', 1000000000 * Math.pow(10, this.decimals));
define('foundationReserve', '0xffffffffffffffffffffffffffffffffffffffff');
