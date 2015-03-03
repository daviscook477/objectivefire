describe('test', function() {

  var ObjectiveFire, ObjectClass, Properties;

  beforeEach(function () {
    module('objective-fire');
    inject(function (_ObjectiveFire_, _ObjectClass_, _Properties_) {
      ObjectiveFire = _ObjectiveFire_;
      ObjectClass = _ObjectClass_;
      Properties = _Properties_;
    });
  });

  it("will be true", function() {
    expect(true).toBe(true);
  })

})
