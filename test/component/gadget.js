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
            "on/publish no exception when there is no subscriber" : function () {
                var g1 = new Gadget();

                g1
                .publish.apply(g1);
            },
            "on/publish and on/subscribe" : function () {
                var g1 = new Gadget();

                g1
                .subscribe(test_args[0], function(){
                    assert(true);
                })
                .publish.apply(g1);
            },
            "on/publish and on/subscribe with args" : function () {
                var g1 = new Gadget();

                g1
                .subscribe(test_args[0], function(){
                    allSame(arguments, test_args);
                })
                .publish.apply(g1, test_args);
            },
            "on/publish and on/subscribe multiple times and in order" : function () {
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
            "on/publish and on/subscribe (cross gadget)" : function () {

                var g1 = new Gadget();
                var g2 = new Gadget();

                g1.subscribe(test_args[0], function(topic, test){
                    allSame(arguments, test_args);
                });

                g2.publish.apply(g2, test_args)
            }
        });
    });
});