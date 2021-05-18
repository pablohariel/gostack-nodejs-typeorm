import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const caterogyRepository = getRepository(Category);

    if (
      type === 'outcome' &&
      (await transactionsRepository.getBalance()).total < value
    ) {
      throw new AppError('Account does not have enough money');
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
    });
    const checkCategoryExists = await caterogyRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      const newCategory = caterogyRepository.create({
        title: category,
      });
      await caterogyRepository.save(newCategory);
      transaction.category = newCategory;
    } else {
      transaction.category = checkCategoryExists;
    }

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
