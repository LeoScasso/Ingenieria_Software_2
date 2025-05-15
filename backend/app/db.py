from sqlalchemy import MetaData, create_engine

engine = create_engine('sqlite:///../data/DataBase v1.1.db', echo = True)
metadata = MetaData()
