import hashlib
from solana.rpc.api import Client
from solders.keypair import Keypair
from solders.instruction import Instruction
from solders.pubkey import Pubkey
from solders.message import Message
from solders.transaction import VersionedTransaction

def test():
    kp = Keypair()
    MEMO_PROGRAM_ID = Pubkey.from_string("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
    client = Client("https://api.devnet.solana.com")
    ix = Instruction(
        program_id=MEMO_PROGRAM_ID,
        accounts=[],
        data=b"test hash 123"
    )
    res = client.get_latest_blockhash()
    msg = Message([ix], kp.pubkey())
    tx = VersionedTransaction(msg, [kp])
    print("Tx signature:", tx.signatures[0])

test()
