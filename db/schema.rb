# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140815024212) do

  create_table "account_records", force: true do |t|
    t.text    "description"
    t.string  "account_type"
    t.string  "account_name"
    t.float   "amount"
    t.integer "user_id"
    t.integer "paired_record_id"
  end

  add_index "account_records", ["paired_record_id"], name: "index_account_records_on_paired_record_id"
  add_index "account_records", ["user_id"], name: "index_account_records_on_user_id"

  create_table "users", force: true do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "password_digest"
    t.string   "remember_token"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true

end
