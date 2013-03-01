buster.testCase("troopjs-core/component/gadget", function (run) {
    var assert = buster.assert;
    var test_args = ["TEST", "abc", "", 1, 0, false, true, {}];

    /**
     * compare a array of expected result with actual result
     */
    function allSame(actual, expected){
        for(var l = expected.length; l--;){
            assert.same(expected[l], actual[l]);
        }
    }

    require( [ "troopjs-core/component/gadget", "when" ] , function (Gadget, when) {

        run({
            // POSITIVE TESTS
            "publish no exception when there is no subscriber" : function () {
                var g1 = new Gadget();

                g1
                .publish.apply(g1);
            },
            "publish/subscribe" : function () {
                var g1 = new Gadget();

                g1
                .subscribe(test_args[0], function(){
                    assert(true);
                })
                .publish.apply(g1);
            },
            "publish/subscribe with args" : function () {
                var g1 = new Gadget();

                g1
                .subscribe(test_args[0], function(){
                    allSame(arguments, test_args);
                })
                .publish.apply(g1, test_args);
            },
            "publish/subscribe multiple times and in order" : function () {
                var g1 = new Gadget();

                var spy = this.spy();

                g1
                .subscribe(test_args[0], spy)
                .subscribe(test_args[0], function(){

                    assert.called(spy);
                    
                    allSame(arguments, test_args);
                })
                .publish.apply(g1, test_args)
            },
            "publish/subscribe (cross gadget)" : function () {

                var g1 = new Gadget();
                var g2 = new Gadget();

                g1.subscribe(test_args[0], function(topic, test){
                    allSame(arguments, test_args);
                });

                g2.publish.apply(g2, test_args)
            },
            "emit to a topic that no handler is listening": function(){
                var g1 = new Gadget();

                g1.emit.apply(g1, test_args);
            },
            "on/emit": function(){
                var arg = "foobar";
                var g1 = new Gadget();

                g1.on(test_args[0], function(topic, test){
                    assert.same(test, arg);
                });

                g1.emit.call(g1, arg);
            },
            "on/emit on multiple instance should not interfere with each other": function(){
                var arg = "foobar";
                var g1 = new Gadget();
                var g2 = new Gadget();

                g1.on(test_args[0], function(topic, test){
                    assert.same(test, arg);
                });
                g2.on(test_args[0], function(){
                    assert(false);
                });

                g1.emit.call(g1, arg);
            },
            "on() multiple times and the handler received in order": function(){
                var arg = "foobar";
                var g1 = new Gadget();
                var g2 = new Gadget();

                var spy = this.spy();

                g1.on(test_args[0], spy);
                g1.on(test_args[0], function(topic, test){
                    assert.called(spy);
                    assert.same(test, arg);
                });
                g2.on(test_args[0], function(){
                    assert(false);
                });

                g1.emit.call(g1, arg);
            }
        });
    });
});