import * as bcrypt from 'bcrypt';

async function test() {
    const pass = 'adminpassword';
    const hash = await bcrypt.hash(pass, 10);
    const match = await bcrypt.compare(pass, hash);
    console.log('Password:', pass);
    console.log('Hash:', hash);
    console.log('Match:', match);

    // Test with the specific hash if I can get it from DB, but let's just test logic first.
}

test().catch(console.error);
