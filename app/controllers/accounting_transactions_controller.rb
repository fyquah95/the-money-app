class AccountingTransactionsController < ApplicationController
  before_action do
    @accounting_transaction = AccountingTransaction.find(params[:id])
  end
  before_action :signed_in_users_only
  before_action :account_book_must_be_editable , :only => [:destroy , :update]
  before_action :account_book_must_be_viewable , :only => [:show]

  def show
    render :json => { :accounting_transaction => @accounting_transaction.as_json(:methods => [:amount , :debit_records, :credit_records]) }
  end
  # to_json

  def destroy
    @accounting_transaction.destroy
    render :status => 204 , :json => nil
  end

  def update
    puts "parameters:"
    puts accounting_transaction_params
    puts "ori parameters"
    puts params
    if @accounting_transaction.update_attributes(accounting_transaction_params)
      render :json => { :accounting_transaction => @accounting_transaction.as_json(:methods => [:amount, :debit_records , :credit_records]) } , :status => 201
    else
      render :json => { :error => @accounting_transaction.errors.full_messages } , :status => 401
    end
  end

  private 
    def accounting_transaction_params
      params.require(:accounting_transaction).permit(:id , :description, :date , :debit_records_attributes => [:id , :account_name , :amount , :account_type , :_destroy, :accounting_transaction_id, :account_book_id] , :credit_records_attributes => [:id , :account_name , :amount , :account_type , :_destroy, :accounting_transaction_id, :account_book_id])
    end

    def account_book_must_be_viewable
      unless @accounting_transaction.account_book.can_be_viewed_by? current_user
        render :json => { :error => "You are not authorized to peform this action" } , :status => 401
      end
    end

    def account_book_must_be_editable
      unless @accounting_transaction.account_book.can_be_edited_by? current_user
        render :json => { :error => "You are not authorized to peform this action" } , :status => 401
      end
    end
end
  # before_action :find_viewable_account_book , :only => [:index , :show]
  # before_action :find_editable_account_book , :only => [:edit , :update , :create , :new , :destroy]

  # def index
  #   if params[:account_name].nil? || params[:account_name].empty?
  #     @accounting_transactions = @account_book.accounting_transactions.paginate(page: params[:page])
  #   else
  #     @accounting_transactions = @account_book.accounting_transactions.contains_records_of(params[:account_name].downcase).paginate(page: params[:page])
  #   end
  # end

  # def new
  #   @accounting_transaction = @account_book.accounting_transactions.build
  # end

  # def edit
  #   @accounting_transaction = @account_book.accounting_transactions.find params[:id]
  # end

  # def create
  #   @accounting_transaction = @account_book.accounting_transactions.build(accounting_transaction_params)
  #   @accounting_transaction.author = current_user
  #   p @accounting_transaction
  #   if @accounting_transaction.save
  #     flash[:success] = "recorded transaction"
  #     respond_to do |format|
  #       format.html do
  #         redirect_to({
  #           :action => "show",
  #           :account_book_id => @account_book.id,
  #           :id => @accounting_transaction.id
  #         })
  #       end
  #       format.json { render :json => {
  #         :accounting_transaction => @accounting_transaction 
  #       }}
  #     end
  #   else
  #     respond_to do |format|
  #       format.json do 
  #         render(:json => { 
  #           :errors =>  @accounting_transaction.errors.full_messages
  #         } ,:status => 422)
  #       end
  #       format.html{ render 'new' }
  #     end
  #     puts 'cannot'
  #   end
  # end


  # if @accounting_transaction.update_attributes accounting_transaction_params
  #   flash[:success] = "updated transaction"
  #   redirect_to({
  #     :action => "show",
  #     :account_book_id => @account_book.id,
  #     :id => @accounting_transaction.id
  #   })
  # else
  #   respond_to do |format|
  #     format.json do 
  #       render(:json => { 
  #         :errors =>  @accounting_transaction.errors.full_messages
  #       } ,:status => 422)
  #     end
  #     format.html{ render 'edit' }
  #   end
  # end
  # end

  

  # def destroy
  #   @accounting_transaction = AccountingTransaction.find(params[:id])
  #   if @accounting_transaction.destroy
  #     flash[:success] = "Deleted transaction!"
  #     redirect_to account_book_accounting_transactions_path(:account_book_id => @account_book.id , :id => @accounting_transaction.id)
  #   else
  #     flash[:error] = "Looks like an error has occured"
  #   end
  # end