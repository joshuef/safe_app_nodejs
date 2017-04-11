const should = require('should');
const h = require('./helpers');

describe('Immutable Data', () => {
  const app = h.createAuthenticatedTestApp();
  const TAG_TYPE = 15639;
  const TEST_NAME_PUBLIC = 'test-name-public--01010101010101';

  it('write read simple ', () => {
    const testString = `test-${Math.random()}`;

    return app.immutableData.create()
      .then((w) => w.write(testString)
        .then(() => w.close())
        .then((addr) => app.immutableData.fetch(addr)
           .then((r) => r.read())
           .then((res) => {
             should(res.toString()).equal(testString);
           })));
  });

  it.skip('store address in a MD', () => {
    const testString = `test-${Math.random()}`;

    return app.immutableData.create()
      .then((w) => w.write(testString)
        .then(() => w.close())
        .then((addr) => app.mutableData.newPublic(TEST_NAME_PUBLIC, TAG_TYPE)
          .then((md) => md.quickSetup({'key1': addr}))
        ))
      .then(() => app.mutableData.newPublic(TEST_NAME_PUBLIC, TAG_TYPE))
      .then((md) => md.get('key1'))
      .then((value) => app.immutableData.fetch(value.buf))
      .then((r) => r.read())
      .then((res) => {
        console.log("Test string: ", res.toString());
        should(res.toString()).equal(testString);
      })
  });

  it.skip('store address in a serialised/deserialised  MD', () => {
    const testString = `test-${Math.random()}`;

    return app.immutableData.create()
      .then((w) => w.write(testString)
        .then(() => w.close())
        .then((addr) => app.mutableData.newPublic(TEST_NAME_PUBLIC, TAG_TYPE)
          .then((md) => md.serialise())
          .then((serial) => app.mutableData.fromSerial(serial))
            .then((md) => md.getEntries())
            .then((entries) => entries.mutate())
            .then((mut) => mut.insert('key1', addr)
              .then(() => md.applyEntriesMutation(mut))
            )
        ))
      .then(() => app.mutableData.newPublic(TEST_NAME_PUBLIC, TAG_TYPE))
      .then((md) => md.getEntries())
      .then((entries) => entries.forEach((key, value) => {
          app.immutableData.fetch(value.buf)
          .then((r) => r.read())
          .then((res) => {
            console.log("Test string: ", res.toString());
            should(res.toString()).equal(testString);
          });
        })
      )
  });
});
