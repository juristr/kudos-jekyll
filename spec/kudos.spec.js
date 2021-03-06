describe('The Kudoable element', function(){

    var clock,
        fixture,
        kudoable,
        mockDataStore,
        completeKudo = function(){
            kudoable.trigger('touchstart');
            clock.tick(700);
            fireKudoUpdate(1);
        },
        onKudoUpdatesCb,
        fireKudoUpdate = function(kudoCount){
            onKudoUpdatesCb(kudoCount);
        },
        getKudoCount = function(){
            return parseInt(fixture.find('.count .num').html(),10);
        };

    beforeEach(function(){
        //add a dom element to test upon
        var $fixture = $('<div>')
                        .addClass('js-fixture');
        $('body').append($fixture);
        fixture = $fixture;

        // make sure we reset everything
        // $.jStorage.set(document.location.pathname, false);

        // create a simple object matching the service contract
        var data = {
            hasVoted: function() {},
            addKudo: function() {},
            removeKudo: function() {
                fireKudoUpdate(0);
            },
            onKudoUpdates: function(cb) {
                onKudoUpdatesCb = cb;
            }
        };

        mockDataStore = sinon.mock(data);

        var deferred = $.Deferred();
        mockDataStore.expects('hasVoted').returns(deferred.promise());
        deferred.resolve(false);

        //instantiate the kudoable element
        kudoable = fixture.kudoable({
            dataStore: data
        });

        //setup sinon fake timers
        clock = sinon.useFakeTimers();
    });

    afterEach(function(){
        fixture.remove();

        clock.restore();
    });

    describe('when initializing', function(){

        it('should render the basic template', function(){
            // just some queries to make sure we render something
            expect(fixture.find('.kudobject').length).toBe(1);
            expect(fixture.find('.opening').length).toBe(1);
            expect(fixture.find('.count').length).toBe(1);
        });

        it('should be kudoable by default', function(){
            expect(fixture.hasClass('complete')).toBe(false, 'there is no complete class');
        });

        it('should restore the state of the kudo', function(){
            // manually inject the state as if the kudo has already been applied
            // $.jStorage.set(document.location.pathname, true);

            var dataStore = {
                hasVoted: function(){
                    var deferred = $.Deferred();
                    deferred.resolve(true);
                    return deferred.promise();
                },
                onKudoUpdates: function(){}
            };

            // use a separate in-memory kudo element
            var kudoElement = $('<figure>');
            kudoElement.kudoable({
                dataStore: dataStore
            });

            expect(kudoElement.hasClass('complete')).toBe(true);
        });
    });

    describe('when touching', function(){

        beforeEach(function(){
            kudoable.trigger('touchstart');
        });

        it('should activate itself', function(){

            // assert
            expect(fixture.hasClass('active')).toBe(true);
        });

        it('should complete after 700ms', function(){
            // act & assert
            clock.tick(699);
            expect(fixture.hasClass('active')).toBe(true);

            clock.tick(1);
            expect(fixture.hasClass('active')).toBe(false);
        });

        it('should return to its initial state after interrupting the touching', function(){
            kudoable.trigger('touchend');

            clock.tick(700);

            expect(fixture.hasClass('complete')).toBe(false, 'there is no complete class');
            expect(fixture.hasClass('active')).toBe(false, 'there is no active class');
        });

    });

    describe('when entering with the mouse', function(){

        beforeEach(function(){
            kudoable.trigger('mouseenter');
        });

        it('should activate itself', function(){

            // assert
            expect(fixture.hasClass('active')).toBe(true);
        });

        it('should complete after 700ms', function(){
            // act & assert
            clock.tick(699);
            expect(fixture.hasClass('active')).toBe(true);

            clock.tick(1);
            expect(fixture.hasClass('active')).toBe(false);
        });

        it('should return to its initial state when leaving with the mouse', function(){
            kudoable.trigger('mouseleave');
            clock.tick(700);

            expect(fixture.hasClass('complete')).toBe(false, 'there is no complete class');
            expect(fixture.hasClass('active')).toBe(false);
        });

    });

    describe('when completing a kudo', function(){

        it('should add the complete class to the element it is bound to', function(){

            // act
            completeKudo();

            //assert
            expect(fixture.hasClass('complete')).toBe(true);
        });

        it('should increment the kudo count', function(){
            completeKudo();

            expect(getKudoCount()).toBe(1);
        });

    });

    describe('when clicking on the kudo element', function(){

        var eventFired = false;

        beforeEach(function(){
            completeKudo();
            fixture.trigger('click');
        });

        it('should undo the previously added kudo', function(){
            expect(fixture.hasClass('complete')).toBe(false, 'there is no complete class');
        });

        it('should decrement the count', function(){
            expect(getKudoCount()).toBe(0);
        });

        it('should do nothing if the element has not been kudoed before', function(){
            fixture.trigger('click');

            expect(getKudoCount()).toBe(0);
        });

    });

});